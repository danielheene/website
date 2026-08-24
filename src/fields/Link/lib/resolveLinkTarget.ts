import type { LinkFieldData } from '@/types/payload'

/** The pseudo-slug standing in for "this link points outside the CMS". */
export const CUSTOM_URL_SLUG = 'customURL' as const

export type LinkReferenceCollection = 'pages' | 'posts' | 'topics'

/**
 * A populated link reference, narrowed to the fields every consumer actually
 * reads (`title` for `{title}` substitution, `slug` for the href).
 *
 * Deliberately *not* `Page | BlogPostData | Topic` — those are the full
 * generated document types, and `Page.content` recursively contains blocks
 * that embed another `LinkFieldData`. Typing this field with the full
 * documents makes `LinkFieldData` structurally self-referential at depth,
 * which is what breaks `CMSLink`'s prop type (see the LinkGroupBlock
 * Renderer/Footer/Header call sites) — TypeScript compares two expansions of
 * the same recursive relationship produced at different nesting depths and
 * finds them incompatible. Nothing downstream needs more than id/title/slug,
 * so stop the expansion here instead of chasing it through every consumer.
 */
export type LinkReferenceDocument = {
  id: string
  title: string
  slug: string
}

export type LinkReferenceValue = LinkReferenceDocument | string

/**
 * {@link LinkFieldData} with `doc.value` narrowed to {@link
 * LinkReferenceValue} instead of the full generated document union. Use this
 * everywhere a `link` group's data is read — the payload shape is identical,
 * just typed leanly.
 */
export type LinkFieldDataLean = Omit<LinkFieldData, 'doc'> & {
  doc?: LinkFieldData['doc'] extends infer R
    ? R extends {
        relationTo: infer RelationTo
      }
      ? {
          relationTo: RelationTo
          value: LinkReferenceValue
        } | null
      : never
    : never
}

/**
 * A `{ link, id }` entry as stored in a `LinkGroupField` array (`LinkGroupBlock`
 * and similar) — {@link LinkFieldDataLean}'s recursion problem, one level up.
 * `LinkGroupField`'s `entries` array nests a whole `LinkField()` group inside
 * each row, so each entry carries its link data under a `link` key. Define
 * this once and reuse it rather than typing each call site off the generated
 * block interfaces, which carry the same full `Page`/`BlogPostData`/`Topic`
 * documents `LinkFieldDataLean` exists to avoid.
 */
export type LinkGroupEntry = {
  link: LinkFieldDataLean
  id?: string | null
}

/**
 * An entry as stored in a `NavEntries` array (`SiteSettings`'s Header nav and
 * Footer nav/legal columns) — {@link LinkFieldDataLean}'s recursion problem,
 * one level up, for the *other* shape.
 *
 * Unlike {@link LinkGroupEntry}, `NavEntries()` (see `SiteSettings/index.ts`)
 * spreads `LinkField().fields` directly into the array row rather than
 * nesting a `link` sub-group, so each entry's link fields (`linkType`, `doc`,
 * `url`, `label`, …) sit flat alongside `id` — there is no nested `link` key
 * to destructure.
 */
export type NavEntry = LinkFieldDataLean & {
  id?: string | null
}

export type LinkTarget =
  | {
      relationTo: LinkReferenceCollection
      value: LinkReferenceValue
    }
  | {
      relationTo: typeof CUSTOM_URL_SLUG
      value: string
    }

/**
 * Collapses a link's `doc` / `url` pair into the single union the rest of the
 * codebase consumes.
 *
 * The pair is stored rather than the union because `customURL` is not a real
 * collection, and only a real polymorphic relationship gets Payload's
 * automatic population — which both the href and the `{title}` variable
 * depend on. See the design spec for the full reasoning.
 *
 * Returns `null` when neither side is set. Field validation should prevent
 * that, but legacy and partially-written data must not crash a render.
 */
export const resolveLinkTarget = (link?: Partial<LinkFieldDataLean> | null): LinkTarget | null => {
  if (!link) return null

  const { doc, url } = link

  if (doc?.relationTo && doc.value) {
    return {
      relationTo: doc.relationTo,
      value: doc.value,
    }
  }

  if (typeof url === 'string' && url.trim()) {
    return {
      relationTo: CUSTOM_URL_SLUG,
      value: url.trim(),
    }
  }

  return null
}
