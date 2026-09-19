import { describe, expect, it } from 'vitest'

import { buildCreditsValue } from './buildCreditsValue'

type CreditsChild = {
  type: string
  text?: string
  fields?: Record<string, unknown>
  children?: Array<{
    text: string
  }>
}

const paragraphChildren = (value: ReturnType<typeof buildCreditsValue>): CreditsChild[] =>
  (
    value.root.children[0] as unknown as {
      type: string
      children: CreditsChild[]
    }
  ).children

describe('buildCreditsValue', () => {
  it('builds a Lexical document with a photographer link and an Unsplash link', () => {
    const value = buildCreditsValue({
      photographerName: 'Jane Doe',
      photographerProfileUrl: 'https://unsplash.com/@janedoe',
    })

    expect(
      (
        value.root.children[0] as unknown as {
          type: string
        }
      ).type,
    ).toBe('paragraph')

    const children = paragraphChildren(value)

    // The visible text is the plain text nodes plus each link's *children* —
    // every Lexical -> JSX link converter renders the anchor body from
    // `node.children`, not from `fields.text`. See the render-layer test in
    // `creditsRendering.test.tsx`.
    const flatText = children
      .map((node) =>
        node.type === 'link'
          ? (node.children ?? []).map((child) => child.text).join('')
          : (node.text ?? ''),
      )
      .join('')
    expect(flatText).toBe('Jane Doe [Unsplash]')

    const links = children.filter((node) => node.type === 'link')
    expect(links).toHaveLength(2)

    expect(links[0]?.fields).toEqual({
      doc: null,
      linkType: 'custom',
      url: 'https://unsplash.com/@janedoe?utm_source=heene_io&utm_medium=referral',
      newTab: true,
      text: 'Jane Doe',
    })

    expect(links[1]?.fields).toEqual({
      doc: null,
      linkType: 'custom',
      url: 'https://unsplash.com/?utm_source=heene_io&utm_medium=referral',
      newTab: true,
      text: 'Unsplash',
    })
  })

  it('emits lexical’s own linkType vocabulary', () => {
    const value = buildCreditsValue({
      photographerName: 'Jane Doe',
      photographerProfileUrl: 'https://unsplash.com/@janedoe',
    })

    for (const node of paragraphChildren(value).filter((child) => child.type === 'link')) {
      expect(node.fields).toHaveProperty('linkType', 'custom')
    }
  })

  it('carries the link text as a real text child, not only as `fields.text`', () => {
    // Regression guard for the render layer: `children: []` still validates and
    // still passes every `fields`-only assertion above, but renders as an empty
    // `<a href="…"></a>`.
    const value = buildCreditsValue({
      photographerName: 'Jane Doe',
      photographerProfileUrl: 'https://unsplash.com/@janedoe',
    })

    const links = paragraphChildren(value).filter((child) => child.type === 'link')

    expect(links.map((link) => (link.children ?? []).map((child) => child.text).join(''))).toEqual([
      'Jane Doe',
      'Unsplash',
    ])
  })

  it("sets `fields.text` on every link — required by `linkFeatureFields`' validation schema", () => {
    // Regression guard for the actual reported bug: `LinkFeature()` (see
    // `src/fields/RichText/index.ts`) validates link nodes against
    // `linkFeatureFields` (`src/fields/Link/index.ts`), whose row-3 `text`
    // field is `required: true` — not lexical's stock `{linkType, doc, url,
    // newTab}` shape. A link node missing `fields.text` fails validation the
    // moment it is saved, which is exactly what broke selecting an Unsplash
    // import: the credits value built here had no `text` at all.
    const value = buildCreditsValue({
      photographerName: 'Jane Doe',
      photographerProfileUrl: 'https://unsplash.com/@janedoe',
    })

    for (const node of paragraphChildren(value).filter((child) => child.type === 'link')) {
      expect(node.fields).toHaveProperty('text')
      expect(typeof node.fields?.text).toBe('string')
      expect(node.fields?.text).not.toBe('')
    }
  })

  it('keeps the link fields flat — no `link` sub-key', () => {
    // Lexical's stock `LinkFeature` fields are flat (`linkType`, `doc`, `url`,
    // `newTab`) and `linkFeatureFields` keeps them flat too (no nested `link`
    // sub-key) — only `LinkField` itself wraps its rows in a `link` group.
    const value = buildCreditsValue({
      photographerName: 'Jane Doe',
      photographerProfileUrl: 'https://unsplash.com/@janedoe',
    })

    for (const node of paragraphChildren(value).filter((child) => child.type === 'link')) {
      expect(node.fields).not.toHaveProperty('link')
    }
  })
})
