import type { Block, Field } from 'payload'

import { CollectionSlug, type CollectionSlugValue } from '@/types/collections'

/** Collections whose documents are trackable assets. */
export const MEDIA_COLLECTIONS: CollectionSlugValue[] = [
  CollectionSlug.MediaImages,
  CollectionSlug.MediaVideos,
  CollectionSlug.MediaDocuments,
  CollectionSlug.MediaAudios,
]

export interface DocumentReference {
  /** Slug of the referenced collection. */
  relationTo: string
  /** ID of the referenced document. */
  value: string
  /** Dotted path within the source document, for diagnostics. */
  path: string
}

export interface ExtractReferencesOptions {
  /**
   * Restrict results to these collections. Omit to track every relationship,
   * which is what the plugin does by default.
   */
  only?: string[]
  /**
   * Field config of the source collection/global. Required to resolve
   * monomorphic relationships (`relationTo: 'posts'`), whose stored value is a
   * bare id carrying no collection information.
   */
  fields?: Field[]
  /**
   * Config-level block definitions (`config.blocks`). Needed when a blocks
   * field lists `blockReferences` by slug instead of inlining the blocks, since
   * the field itself then carries no field config to walk.
   */
  blocks?: Block[]
}

const isId = (value: unknown): value is string | number =>
  typeof value === 'string' || typeof value === 'number'

/** Resolves either a bare id or a populated document to its id. */
const toId = (value: unknown): string | null => {
  if (isId(value)) return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const { id } = value as {
      id?: unknown
    }
    return isId(id) ? String(id) : null
  }
  return null
}

const joinPath = (parent: string, key: string | number) =>
  parent ? `${parent}.${key}` : String(key)

/**
 * Maps field name -> target collection for monomorphic relationship and upload
 * fields, recursing through the containers that can nest them.
 *
 * Keyed by field name rather than full path: names are stable, whereas full
 * paths vary per block/array index and would have to be recomputed for every
 * document.
 *
 * `blocks` carries the config-level block registry so `blockReferences` entries
 * — which may be a bare slug rather than the block itself — can be resolved.
 * `seen` guards against a block that (transitively) contains itself.
 */
const collectMonomorphicTargets = (
  fields: Field[] | undefined,
  blocks: Map<string, Block> = new Map(),
  target: Map<string, string> = new Map(),
  seen: Set<string> = new Set(),
): Map<string, string> => {
  const walkBlock = (block: Block | string): void => {
    const resolved = typeof block === 'string' ? blocks.get(block) : block
    if (!resolved?.fields) return

    // a slug can appear under several fields; only its first visit adds anything
    if (resolved.slug) {
      if (seen.has(resolved.slug)) return
      seen.add(resolved.slug)
    }

    collectMonomorphicTargets(resolved.fields, blocks, target, seen)
  }

  for (const field of fields ?? []) {
    if (
      (field.type === 'relationship' || field.type === 'upload') &&
      'relationTo' in field &&
      typeof field.relationTo === 'string' &&
      'name' in field &&
      typeof field.name === 'string'
    ) {
      target.set(field.name, field.relationTo)
    }

    if ('fields' in field && Array.isArray(field.fields)) {
      collectMonomorphicTargets(field.fields as Field[], blocks, target, seen)
    }
    if ('blocks' in field && Array.isArray(field.blocks)) {
      for (const block of field.blocks) {
        walkBlock(block as Block | string)
      }
    }
    /**
     *    Blocks defined once on the config and referenced by slug. The field's
     *    own `blocks` array is typically empty in that case, so skipping these
     *    would leave every monomorphic field inside a block untracked.
     */
    if ('blockReferences' in field && Array.isArray(field.blockReferences)) {
      for (const block of field.blockReferences) {
        walkBlock(block as Block | string)
      }
    }
    if ('tabs' in field && Array.isArray(field.tabs)) {
      for (const tab of field.tabs) {
        if (tab && typeof tab === 'object' && 'fields' in tab) {
          collectMonomorphicTargets(tab.fields as Field[], blocks, target, seen)
        }
      }
    }
  }

  return target
}

/**
 * Deep-walks a document and collects every relationship it holds.
 *
 * Handles the three shapes a reference can take:
 *   - polymorphic relationship/upload values — `{ relationTo, value }`
 *   - Lexical `upload` and `relationship` nodes, which use the same shape
 *   - monomorphic relationship/upload fields, whose bare id is resolved to a
 *     collection via `options.fields`
 *
 * Walking the saved document rather than enumerating field paths means blocks,
 * arrays, tabs, groups and rich text are covered without per-entity handling.
 */
export const extractReferences = (
  data: unknown,
  options: ExtractReferencesOptions = {},
): DocumentReference[] => {
  const { only, fields, blocks } = options
  const allowed = only ? new Set(only) : null
  const monomorphic = collectMonomorphicTargets(
    fields,
    new Map(
      (blocks ?? []).map((block) => [
        block.slug,
        block,
      ]),
    ),
  )
  const found = new Map<string, DocumentReference>()

  const add = (relationTo: string, id: string, path: string) => {
    if (allowed && !allowed.has(relationTo)) return
    const key = `${relationTo}:${id}`
    // keep the first path seen; it is the most stable for reporting
    if (!found.has(key)) {
      found.set(key, {
        relationTo,
        value: id,
        path,
      })
    }
  }

  const walk = (node: unknown, path: string, fieldName?: string): void => {
    // monomorphic relationship: a bare id whose field config names the target
    if (isId(node) && fieldName && monomorphic.has(fieldName)) {
      add(monomorphic.get(fieldName) as string, String(node), path)
      return
    }

    if (!node || typeof node !== 'object') return

    if (Array.isArray(node)) {
      node.forEach((item, index) => {
        walk(item, joinPath(path, index), fieldName)
      })
      return
    }

    const record = node as Record<string, unknown>

    // polymorphic shape: { relationTo: 'images', value: <id | doc> }
    if (typeof record.relationTo === 'string') {
      const id = toId(record.value)
      if (id) {
        add(record.relationTo, id, path)
        // a populated value may itself embed further references
        if (record.value && typeof record.value === 'object') {
          walk(record.value, joinPath(path, 'value'))
        }
        return
      }
    }

    // a populated monomorphic relation arrives as the document itself
    if (fieldName && monomorphic.has(fieldName) && isId(record.id)) {
      add(monomorphic.get(fieldName) as string, String(record.id), path)
      return
    }

    for (const [key, value] of Object.entries(record)) {
      walk(value, joinPath(path, key), key)
    }
  }

  walk(data, '')

  return [
    ...found.values(),
  ]
}
