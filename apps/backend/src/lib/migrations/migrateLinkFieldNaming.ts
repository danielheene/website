/**
 * Only literal `{}` objects are rebuilt. Mongo documents carry `ObjectId`,
 * `Date` and `Buffer` values whose prototypes would be stripped by a naive
 * spread, silently corrupting every document the walker touches.
 */
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false

  const prototype = Object.getPrototypeOf(value)

  return prototype === Object.prototype || prototype === null
}

/**
 * Structural test for "this object is a link". Links appear under several
 * different keys — `link`, lexical's `fields`, array entries — so shape is
 * the only reliable signal. Matches both the pre-rename shape (`reference`)
 * and the post-rename shape already carrying `doc`, so a document with a mix
 * of the two (partially migrated, or a link with only `url` set and no
 * relationship key at all) is still recognized.
 */
const isLinkShaped = (value: Record<string, unknown>): boolean =>
  'linkType' in value && ('reference' in value || 'doc' in value || 'url' in value)

/**
 * Rewrites every link-shaped object in a document to `LinkField`'s renamed
 * shape (see `src/fields/Link/index.ts`), which now matches lexical's own
 * `LinkFeature` base-field naming instead of a bespoke one:
 *
 *   linkType: 'reference' -> 'internal'
 *   linkType: 'url'       -> 'custom'
 *   reference              -> doc
 *
 * Pure and idempotent — an object already carrying `linkType: 'internal' |
 * 'custom'` and `doc` (no `reference` key) is returned unchanged and not
 * counted.
 */
export const migrateLinkFieldNaming = (
  input: unknown,
): {
  value: unknown
  changed: number
} => {
  let changed = 0

  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk)

    if (!isPlainObject(node)) return node

    const next: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(node)) {
      next[key] = walk(value)
    }

    if (!isLinkShaped(next)) return next

    let touched = false

    if (next.linkType === 'reference') {
      next.linkType = 'internal'
      touched = true
    } else if (next.linkType === 'url') {
      next.linkType = 'custom'
      touched = true
    }

    if ('reference' in next) {
      if (next.doc === undefined) next.doc = next.reference
      delete next.reference
      touched = true
    }

    if (touched) changed += 1

    return next
  }

  return {
    value: walk(input),
    changed,
  }
}
