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
 * {@link LinkFieldData} with `reference.value` narrowed to
 * {@link LinkReferenceValue} instead of the full generated document union.
 * Use this everywhere a `link` group's data is read — the payload shape is
 * identical, just typed leanly.
 */
export type LinkFieldDataLean = Omit<LinkFieldData, 'reference'> & {
  reference?: LinkFieldData['reference'] extends infer R
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
 * A `{ link, id }` entry as stored in a link-group array (the Footer nav
 * columns, legal links, `LinkGroupBlock`, and similar) — {@link
 * LinkFieldDataLean}'s recursion problem, one level up. Define this once and
 * reuse it rather than typing each call site off the generated global/block
 * interfaces (`FooterSettings['column1']`, etc.), which carry the same full
 * `Page`/`BlogPostData`/`Topic` documents `LinkFieldDataLean` exists to avoid.
 */
export type LinkGroupEntry = {
  link: LinkFieldDataLean
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
 * Collapses a link's `reference` / `url` pair into the single union the rest
 * of the codebase consumes.
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

  const { reference, url } = link

  if (reference?.relationTo && reference.value) {
    return {
      relationTo: reference.relationTo,
      value: reference.value,
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
