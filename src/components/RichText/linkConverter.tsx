import type { SerializedLinkNode } from '@payloadcms/richtext-lexical'
import type { JSXConverters } from '@payloadcms/richtext-lexical/react'

import type { LinkFieldDataLean } from '@/fields/Link/lib/resolveLinkTarget'
import { CUSTOM_URL_SLUG, resolveLinkTarget } from '@/fields/Link/lib/resolveLinkTarget'
import { generateContentURL } from '@/lib/generateContentURL'

/**
 * The `link` node converter, split into its own module so it can be unit
 * tested without pulling in `RichText/index.tsx`'s other converters — the
 * `blocks.CodeBlock` converter transitively imports `@payloadcms/ui`'s
 * `CopyIcon` (via `CodeBlockShell` -> `CopyButton`), which ships a `.scss`
 * import Vitest's default Node transform can't load. See `src/fields/Icon/
 * index.ts` for the same class of problem in a different module.
 *
 * `LinkFeature()` (see `src/fields/RichText/index.ts`) uses lexical's own
 * stock link fields — `{ linkType: 'internal' | 'custom', doc, url, newTab }`
 * — rather than swapping in `LinkField`'s fields. `LinkField` deliberately
 * uses the same names/values (see its module doc comment), so `node.fields`
 * here is resolved through the same `resolveLinkTarget` helper `CMSLink`
 * uses for `LinkField`-backed data elsewhere, rather than a separate
 * lexical-only code path.
 */
export const linkConverter: JSXConverters<SerializedLinkNode>['link'] = ({ node, nodesToJSX }) => {
  // `node.fields` is lexical's own stock `LinkFields` shape. It has no
  // `label`/`iconBefore`/`iconAfter`/`iconOnly` (those only exist on
  // `LinkField`-backed data, where there's no selected editor text to derive
  // a label from) and `doc.value` is untyped `JsonValue` rather than
  // `resolveLinkTarget`'s narrower `LinkReferenceValue` — close enough in
  // shape for `resolveLinkTarget` (which only reads `doc`/`url`), not close
  // enough for a direct assignment, hence the `unknown` hop.
  const fields = node.fields as unknown as LinkFieldDataLean | undefined
  const children = nodesToJSX({
    nodes: node.children,
  })

  if (!fields) return <>{children}</>

  const target = resolveLinkTarget(fields)

  if (!target) return <>{children}</>

  // Only a populated reference carries a slug; an unpopulated one is a
  // bare id, which cannot be turned into a URL.
  const href =
    target.relationTo === CUSTOM_URL_SLUG
      ? target.value
      : typeof target.value === 'object' && target.value.slug
        ? generateContentURL({
            collection: target.relationTo,
            slug: target.value.slug,
          })
        : null

  if (!href) return <>{children}</>

  return (
    <a
      href={href}
      {...(fields.newTab
        ? {
            target: '_blank',
            rel: 'noopener noreferrer',
          }
        : {})}
    >
      {children}
    </a>
  )
}

export default linkConverter
