import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/**
 * Treats a Lexical value as empty when it has no children, or its only
 * child (Payload's default persisted shape for an empty `RichTextField` is
 * a single empty paragraph) has no children of its own.
 */
export const isEmptyValue = (value: SerializedEditorState | undefined): boolean => {
  const children = (
    value?.root as
      | {
          children?: unknown[]
        }
      | undefined
  )?.children
  if (!children || children.length === 0) return true
  if (children.length > 1) return false
  const [onlyChild] = children as Array<{
    children?: unknown[]
  }>
  return !onlyChild.children || onlyChild.children.length === 0
}
