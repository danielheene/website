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
 * the only reliable signal.
 */
const isLinkShaped = (value: Record<string, unknown>): boolean =>
  'label' in value && ('reference' in value || 'url' in value || 'type' in value)

/**
 * Rewrites every link-shaped object in a document to the post-unification
 * shape: `icon` becomes `iconBefore`, and the now-removed `type` discriminator
 * is dropped.
 *
 * Pure and idempotent — an object already carrying `iconBefore` and no `type`
 * is returned unchanged and not counted.
 */
export const migrateLinkFields = (
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

    if ('type' in next) {
      delete next.type
      touched = true
    }

    if ('icon' in next) {
      if (next.iconBefore === undefined) next.iconBefore = next.icon
      delete next.icon
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
