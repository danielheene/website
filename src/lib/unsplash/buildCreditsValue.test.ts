import { describe, expect, it } from 'vitest'

import { buildCreditsValue } from './buildCreditsValue'

describe('buildCreditsValue', () => {
  it('builds a Lexical document with a photographer link and an Unsplash link', () => {
    const value = buildCreditsValue({
      photographerName: 'Jane Doe',
      photographerProfileUrl: 'https://unsplash.com/@janedoe',
    })

    const paragraph = value.root.children[0] as {
      type: string
      children: Array<{
        type: string
        text?: string
        fields?: {
          linkType: string
          url: string
          newTab: boolean
        }
        children?: Array<{
          text: string
        }>
      }>
    }

    expect(paragraph.type).toBe('paragraph')

    const flatText = paragraph.children
      .map((node) => node.text ?? node.children?.map((child) => child.text).join(''))
      .join('')
    expect(flatText).toBe('Photo by Jane Doe on Unsplash')

    const photographerLink = paragraph.children.find(
      (node) => node.type === 'link' && node.children?.[0]?.text === 'Jane Doe',
    )
    expect(photographerLink?.fields).toEqual({
      linkType: 'custom',
      url: 'https://unsplash.com/@janedoe?utm_source=heene_io&utm_medium=referral',
      newTab: true,
    })

    const unsplashLink = paragraph.children.find(
      (node) => node.type === 'link' && node.children?.[0]?.text === 'Unsplash',
    )
    expect(unsplashLink?.fields).toEqual({
      linkType: 'custom',
      url: 'https://unsplash.com/?utm_source=heene_io&utm_medium=referral',
      newTab: true,
    })
  })
})
