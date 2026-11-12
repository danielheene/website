import { describe, expect, it } from 'vitest'

import { extractDocumentText } from './extractDocumentText'

const richText = (...texts: string[]) => ({
  root: {
    type: 'root',
    children: texts.map((text) => ({
      type: 'paragraph',
      children: [
        {
          type: 'text',
          text,
        },
      ],
    })),
  },
})

describe('extractDocumentText', () => {
  it('collects titles and rich text in document order', () => {
    const text = extractDocumentText({
      title: 'Caching in Next.js',
      slug: 'caching-in-next-js',
      content: richText('First paragraph.', 'Second paragraph.'),
    })

    expect(text).toBe('Caching in Next.js\nFirst paragraph.\nSecond paragraph.')
  })

  it('reaches text nested in hero slides and layout blocks', () => {
    const text = extractDocumentText({
      layout: {
        hero: {
          slides: [
            {
              content: richText('Hero line.'),
            },
          ],
        },
        content: [
          {
            blockType: 'feature-cards',
            title: 'What I do',
            cards: [
              {
                title: 'Frontend',
                description: richText('React and TypeScript.'),
              },
            ],
          },
        ],
      },
    })

    expect(text).toBe('Hero line.\nWhat I do\nFrontend\nReact and TypeScript.')
  })

  it('leaves out the search-preview fields and non-text values', () => {
    const text = extractDocumentText({
      title: 'About',
      slug: 'about',
      updatedAt: '2026-01-01',
      relatedPost: '64b7f0c2a1',
      meta: {
        title: 'Old meta title',
        description: 'Old meta description',
      },
    })

    expect(text).toBe('About')
  })

  it('keeps a repeated string once and collapses whitespace', () => {
    const text = extractDocumentText({
      title: 'Same',
      content: richText('Same', '  spaced \n out  '),
    })

    expect(text).toBe('Same\nspaced out')
  })

  it('returns an empty string for values without text', () => {
    expect(extractDocumentText(null)).toBe('')
    expect(extractDocumentText({})).toBe('')
    expect(extractDocumentText('title')).toBe('')
  })
})
