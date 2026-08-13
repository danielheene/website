/**
 * Path of a sibling field within the same group.
 *
 * Derived from the caller's own path rather than hardcoded, because the link
 * fields are spread into lexical's `LinkFeature` as well as rendered in
 * normal document forms — and the drawer nests them at a shallower depth.
 */
export const siblingPath = (path: string, name: string): string => path.replace(/[^.]+$/, name)
