import { renderToStaticMarkup } from 'react-dom/server'
import {
  convertLexicalNodesToJSX,
  defaultJSXConverters,
  LinkJSXConverter,
} from '@payloadcms/richtext-lexical/react'

import { describe, expect, it } from 'vitest'

import { buildCreditsValue } from './buildCreditsValue'

/**
 * A *render*-boundary test for the credits value, complementing the
 * validation-boundary test in `creditsLinkValidation.test.ts`.
 *
 * Passing Payload's link validation and rendering as a visible hyperlink are
 * two independent contracts, and a link node can satisfy the first while
 * failing the second: `children: []` validates fine (validation only ever
 * inspects `node.fields`) but renders as an empty `<a href="…"></a>`, because
 * every Lexical -> JSX link converter builds the anchor body from
 * `nodesToJSX({ nodes: node.children })` and never from `fields.label`.
 *
 * This drives Payload's own converter stack — `convertLexicalNodesToJSX` with
 * `defaultJSXConverters` + `LinkJSXConverter` — over the real output of
 * `buildCreditsValue`, and asserts on the resulting HTML.
 *
 * Scope note: `src/components/RichText/index.tsx` uses its own `link`
 * converter (`src/components/RichText/linkConverter.tsx`, unit-tested in
 * `RichText/linkConverter.test.tsx`), not the bare `defaultJSXConverters` +
 * `LinkJSXConverter` stack this file drives. That override correctly reads
 * `node.fields` directly (the group's *inner* fields, flat — `LinkFeature`
 * is configured with `[...LinkField().fields]`), rather than the nested
 * `node.fields.link` shape an earlier version of it read by mistake. This
 * file is deliberately scoped to the generic Payload converter stack, not
 * this project's override, so it doesn't re-assert that fix here.
 */

// biome-ignore lint/suspicious/noExplicitAny: converter args are structurally typed against internal Lexical node unions
type ConverterArgs = any

const renderCredits = (value: ReturnType<typeof buildCreditsValue>): string =>
  renderToStaticMarkup(
    convertLexicalNodesToJSX({
      converters: {
        ...defaultJSXConverters,
        ...LinkJSXConverter({
          internalDocToHref: () => '#',
        }),
      },
      nodes: value.root.children,
      parent: {
        ...value.root,
        parent: undefined,
      },
    } as ConverterArgs) as ConverterArgs,
  )

describe('credits value rendering', () => {
  it('renders both credits as anchors with visible text and the UTM-tagged hrefs', () => {
    const html = renderCredits(
      buildCreditsValue({
        photographerName: 'Jane Doe',
        photographerProfileUrl: 'https://unsplash.com/@janedoe',
      }),
    )

    expect(html).toContain(
      '<a href="https://unsplash.com/@janedoe?utm_source=heene_io&amp;utm_medium=referral" rel="noopener noreferrer" target="_blank">Jane Doe</a>',
    )
    expect(html).toContain(
      '<a href="https://unsplash.com/?utm_source=heene_io&amp;utm_medium=referral" rel="noopener noreferrer" target="_blank">Unsplash</a>',
    )

    // No empty anchors: the exact failure mode `children: []` produced.
    expect(html).not.toMatch(/<a\b[^>]*><\/a>/)
    expect(html.replace(/<[^>]+>/g, '')).toBe('Photo by Jane Doe on Unsplash')
  })

  it('is a real render boundary: emptying the link children produces empty anchors', () => {
    // Negative control. Without this, the assertions above would be
    // indistinguishable from a harness that renders anything into an anchor.
    const value = buildCreditsValue({
      photographerName: 'Jane Doe',
      photographerProfileUrl: 'https://unsplash.com/@janedoe',
    })

    for (const node of (
      value.root.children[0] as unknown as {
        children: Array<{
          type: string
          children: unknown[]
        }>
      }
    ).children) {
      if (node.type === 'link') node.children = []
    }

    expect(renderCredits(value).replace(/<[^>]+>/g, '')).toBe('Photo by  on ')
  })
})
