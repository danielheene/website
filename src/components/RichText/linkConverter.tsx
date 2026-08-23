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
 * `LinkFeature({ fields: [...LinkField().fields] })` (see
 * `src/fields/RichText/index.ts`) spreads `LinkField`'s *inner* fields
 * directly as the link node's schema — lexical's `transformExtraFields`
 * replaces its default `linkType`/`url`/`newTab` base fields with these,
 * rather than merging them under a nested key. So `node.fields` here is
 * already the flat `{ linkType, reference, url, newTab, iconBefore, label,
 * iconAfter, iconOnly }` shape `resolveLinkTarget` expects — not nested
 * under a `link` sub-key, and not `LinkJSXConverter`'s own `{ linkType,
 * url, doc }` shape either. Links are resolved through the same
 * `resolveLinkTarget` helper `CMSLink` uses, reading `node.fields` directly.
 */
export const linkConverter: JSXConverters<SerializedLinkNode>['link'] = ({ node, nodesToJSX }) => {
  // `node.fields` is typed as lexical's own stock `LinkFields` shape
  // (`{ linkType, url, doc, newTab }`), but at runtime — per the module doc
  // comment above — it is actually `LinkField`'s replaced flat shape. The
  // two types don't overlap enough for a direct `as`, hence the `unknown`
  // hop.
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
