import type { BlogPostData, LinkFieldData, Page, Topic } from '@/types/payload'

/** The pseudo-slug standing in for "this link points outside the CMS". */
export const CUSTOM_URL_SLUG = 'customURL' as const

export type LinkReferenceCollection = 'pages' | 'posts' | 'topics'
export type LinkReferenceValue = BlogPostData | Page | Topic | string

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
export const resolveLinkTarget = (link?: Partial<LinkFieldData> | null): LinkTarget | null => {
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
