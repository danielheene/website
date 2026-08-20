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

    // The visible text is the plain text nodes plus each link's `label` —
    // link nodes carry no text children, because `CMSLink` renders
    // `resolvedLabel || label` and then the children, which would otherwise
    // print the link text twice.
    const flatText = children
      .map((node) => (node.type === 'link' ? (node.fields?.label as string) : (node.text ?? '')))
      .join('')
    expect(flatText).toBe('Photo by Jane Doe on Unsplash')

    const links = children.filter((node) => node.type === 'link')
    expect(links).toHaveLength(2)

    expect(links[0]?.fields).toEqual({
      reference: null,
      url: 'https://unsplash.com/@janedoe?utm_source=heene_io&utm_medium=referral',
      newTab: true,
      label: 'Jane Doe',
    })

    expect(links[1]?.fields).toEqual({
      reference: null,
      url: 'https://unsplash.com/?utm_source=heene_io&utm_medium=referral',
      newTab: true,
      label: 'Unsplash',
    })
  })

  it('emits no `linkType` field — the caption editor replaces the base link fields', () => {
    const value = buildCreditsValue({
      photographerName: 'Jane Doe',
      photographerProfileUrl: 'https://unsplash.com/@janedoe',
    })

    for (const node of paragraphChildren(value).filter((child) => child.type === 'link')) {
      expect(node.fields).not.toHaveProperty('linkType')
      expect(node.children).toEqual([])
    }
  })
})
