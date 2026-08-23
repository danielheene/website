import { renderToStaticMarkup } from 'react-dom/server'
import { convertLexicalNodesToJSX, defaultJSXConverters } from '@payloadcms/richtext-lexical/react'

import { describe, expect, it } from 'vitest'

import { linkConverter } from './linkConverter'

/**
 * A render-boundary test for the `link` converter override, closing the gap
 * `creditsRendering.test.tsx` deliberately left open: that file's "Scope
 * note" documented that this converter used to read `node.fields.link` (a
 * nested sub-key), which is always `undefined` for this project's
 * `LinkFeature` — configured with `[...LinkField().fields]`, which spreads
 * the group's *inner* fields flat onto the link node's `fields` object
 * directly, never nested under a `link` key. The old code therefore dropped
 * the `<a>` for every link in every rich text field, human-authored ones
 * included.
 *
 * Imports only `linkConverter`, not `RichText/index.tsx` itself — that
 * module's `blocks.CodeBlock` converter transitively pulls in
 * `@payloadcms/ui`'s `CopyIcon` (via `CodeBlockShell` -> `CopyButton`),
 * which ships a `.scss` import Vitest's Node transform can't load.
 */

// biome-ignore lint/suspicious/noExplicitAny: converter args are structurally typed against internal Lexical node unions
type ConverterArgs = any

const linkNode = (fields: Record<string, unknown>, text: string) => ({
  type: 'link',
  version: 3,
  format: '',
  indent: 0,
  direction: 'ltr',
  fields,
  children: [
    {
      type: 'text',
      version: 1,
      format: 0,
      style: '',
      mode: 'normal',
      detail: 0,
      text,
    },
  ],
})

const renderNode = (node: unknown): string =>
  renderToStaticMarkup(
    convertLexicalNodesToJSX({
      converters: {
        ...defaultJSXConverters,
        link: linkConverter,
      },
      nodes: [
        node,
      ],
      parent: {
        type: 'root',
        children: [],
        parent: undefined,
      },
    } as ConverterArgs) as ConverterArgs,
  )

describe('linkConverter', () => {
  it('renders a custom-URL link as a real <a> tag, reading the flat field shape', () => {
    const html = renderNode(
      linkNode(
        {
          linkType: 'url',
          reference: null,
          url: 'https://example.com',
          newTab: true,
          label: 'Example',
        },
        'Example',
      ),
    )

    expect(html).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Example</a>',
    )
  })

  it('renders without target/rel when newTab is not set', () => {
    const html = renderNode(
      linkNode(
        {
          linkType: 'url',
          reference: null,
          url: 'https://example.com',
          label: 'Example',
        },
        'Example',
      ),
    )

    expect(html).toBe('<a href="https://example.com">Example</a>')
  })

  it('falls back to bare children when the link has no resolvable target', () => {
    const html = renderNode(
      linkNode(
        {
          linkType: 'reference',
          reference: null,
          url: null,
          label: 'Nowhere',
        },
        'Nowhere',
      ),
    )

    expect(html).toBe('Nowhere')
    expect(html).not.toContain('<a')
  })
})
