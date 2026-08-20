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
 * Scope note: `src/components/RichText/index.tsx` overrides the `link`
 * converter with one that reads `node.fields.link` (a nested sub-key). This
 * project's `LinkFeature` is configured with `[...LinkField().fields]`, which
 * spreads the group's *inner* fields, so a link node's `fields` object is flat
 * and that override's `nested` lookup is always `undefined` — it drops the
 * `<a>` for every link in every rich text field, human-authored ones included.
 * That is a pre-existing bug in shared rendering infrastructure, not something
 * this module can or should work around, so it is deliberately not asserted
 * here.
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
