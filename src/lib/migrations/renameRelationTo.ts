/**
 * Rewrites every `relationTo: from` in a stored document to `to`, at any depth:
 * polymorphic relations, link fields and lexical nodes all store the target
 * collection's slug that way. Returns null when nothing matched.
 */
export const renameRelationTo = <T>(value: T, from: string, to: string): T | null => {
  let changed = false

  const visit = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(visit)

    // leaves ObjectIds, Dates and other non-plain values untouched
    if (!node || typeof node !== 'object' || Object.getPrototypeOf(node) !== Object.prototype) {
      return node
    }

    return Object.fromEntries(
      Object.entries(node).map(([key, child]) => {
        if (key === 'relationTo' && child === from) {
          changed = true

          return [key, to]
        }

        return [key, visit(child)]
      }),
    )
  }

  const result = visit(value)

  // SAFETY: visit only swaps string values, so the result keeps T's shape.
  return changed ? (result as T) : null
}
