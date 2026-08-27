import config from '@payload-config'
import { getPayload } from 'payload'

import { CollectionSlug, CollectionSlugValue, RegisteredCollectionSlug } from '@/types/collections'

// biome-ignore lint/suspicious/noExplicitAny: matching any callable signature
type AnyFunction = (...args: any[]) => any

/**
 * The shape of a polymorphic relation as emitted by Payload: an object holding
 * the target collection slug and either the referenced id (`string`) or the
 * already-populated document.
 */
type Relation = {
  relationTo: RegisteredCollectionSlug
  value: unknown
}

/**
 * Recursively resolves every polymorphic relation in `T` so that each relation's
 * `value` is guaranteed to be the referenced document — the bare id (`string`)
 * is excluded. Non-relation objects and arrays are walked so nested relations at
 * any depth are resolved as well.
 */
export type ResolvedRelations<T> = T extends AnyFunction
  ? T
  : T extends Relation
    ? { [K in keyof T]: K extends 'value' ? ResolvedRelations<Exclude<T[K], string>> : T[K] }
    : T extends object
      ? { [K in keyof T]: ResolvedRelations<T[K]> }
      : T

const isRelation = (
  data: unknown,
): data is Relation & {
  relationTo: RegisteredCollectionSlug
} => {
  return (
    !!data &&
    typeof data === 'object' &&
    'relationTo' in data &&
    typeof data.relationTo === 'string' &&
    Object.values(CollectionSlug).includes(data.relationTo as CollectionSlugValue) &&
    'value' in data &&
    (typeof data.value === 'string' || typeof data.value === 'object')
  )
}

/**
 * Deep-walks `data` and resolves every polymorphic relation it contains: string
 * references are fetched from their collection, and already-populated relations
 * are traversed so nested relations resolve too.
 *
 * The returned type is `ResolvedRelations<...>`, so the frontend can rely on
 * every relation's `value` being the referenced document rather than an id.
 *
 * @param data The queried data (a document, global, block, array, …).
 * @returns The same structure with all relations resolved.
 */
export const resolveRelations = async <T>(data: T): Promise<ResolvedRelations<T>> => {
  'use server'

  const payload = await getPayload({
    config,
  })

  /**
   * `seen` tracks the `${relationTo}:${id}` references along the current branch
   * so circular references (e.g. a post relating back to itself) cannot cause
   * infinite fetching.
   */
  const walk = async (node: unknown, seen: ReadonlySet<string>): Promise<unknown> => {
    if (Array.isArray(node)) {
      return Promise.all(node.map((item) => walk(item, seen)))
    }

    if (isRelation(node)) {
      /**
       * Sibling keys are spread back in: Lexical upload nodes also match the
       * `{relationTo, value}` shape, and dropping their `type`/`version`/
       * `format` fields would leave the JSX converters unable to dispatch them.
       */

      /**
       * Already-populated relation: keep the wrapper, resolve deeper relations
       * inside the referenced document.
       */
      if (typeof node.value === 'object') {
        return {
          ...node,
          relationTo: node.relationTo,
          value: await walk(node.value, seen),
        }
      }

      /**
       * Unresolved reference (string id): stop on a cycle, otherwise fetch the
       * document and continue walking it. A stale reference resolves to null.
       */
      const reference = `${node.relationTo}:${node.value}`
      if (seen.has(reference))
        return {
          ...node,
          relationTo: node.relationTo,
          value: null,
        }

      const value = await payload
        .findByID({
          collection: node.relationTo,
          id: node.value as string | number,
        })
        .catch(() => null)

      return {
        ...node,
        relationTo: node.relationTo,
        value: value ? await walk(value, new Set(seen).add(reference)) : null,
      }
    }

    if (node && typeof node === 'object') {
      const entries = await Promise.all(
        Object.entries(node).map(
          async ([key, value]) =>
            [
              key,
              await walk(value, seen),
            ] as const,
        ),
      )
      return Object.fromEntries(entries)
    }

    return node
  }

  return (await walk(data, new Set<string>())) as ResolvedRelations<T>
}
