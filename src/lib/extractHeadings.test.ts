import { describe, expect, it } from 'vitest'

import { BlockSlug } from '@/types/blocks'

import {
  createAnchorId,
  createHeadingIdGenerator,
  extractHeadings,
  getBlockAnchors,
} from './extractHeadings'

const text = (value: string) => ({
  type: 'text',
  text: value,
})

const heading = (tag: string, ...children: unknown[]) => ({
  type: 'heading',
  tag,
  children,
})

const doc = (...children: unknown[]) => ({
  root: {
    children,
  },
})

describe('createHeadingIdGenerator', () => {
  it('slugifies with dashes and suffixes repeats', () => {
    const generateId = createHeadingIdGenerator()

    expect(generateId('About Me')).toBe('about-me')
    expect(generateId('AboutMe')).toBe('about-me-1')
    expect(generateId('About me')).toBe('about-me-2')
  })

  it('falls back to "section" for titles without slug characters', () => {
    expect(createAnchorId('!!!')).toBe('section')
  })
})

describe('extractHeadings', () => {
  it('reads the headings of a Lexical document', () => {
    expect(
      extractHeadings(
        doc(
          heading('h2', text('Intro')),
          {
            type: 'paragraph',
            children: [text('body')],
          },
          heading('h3', text('Details')),
        ),
      ),
    ).toEqual([
      {
        id: 'intro',
        title: 'Intro',
        level: 2,
        kind: 'heading',
        blockIndex: undefined,
      },
      {
        id: 'details',
        title: 'Details',
        level: 3,
        kind: 'heading',
        blockIndex: undefined,
      },
    ])
  })

  it('includes text nested in links and formatting', () => {
    const [{ title }] = extractHeadings(
      doc(
        heading('h2', text('See '), {
          type: 'link',
          children: [text('the docs')],
        }),
      ),
    )

    expect(title).toBe('See the docs')
  })

  it('turns block titles into sections and nests a titled rich text under its title', () => {
    const headings = extractHeadings([
      {
        blockType: BlockSlug.ResumeAboutMe,
        title: 'About me',
      },
      {
        blockType: BlockSlug.RichText,
        title: 'Notes',
        content: doc(heading('h2', text('First'))),
      },
      {
        blockType: BlockSlug.RichText,
        content: doc(heading('h2', text('Second'))),
      },
    ])

    expect(
      headings.map(({ id, level, kind, blockIndex }) => [id, level, kind, blockIndex]),
    ).toEqual([
      ['about-me', 1, 'section', 0],
      ['notes', 1, 'section', 1],
      ['first', 3, 'heading', 1],
      ['second', 2, 'heading', 2],
    ])
  })

  it('keeps ids unique across blocks', () => {
    const headings = extractHeadings([
      {
        blockType: BlockSlug.RichText,
        content: doc(heading('h2', text('Definitions'))),
      },
      {
        blockType: BlockSlug.RichText,
        content: doc(heading('h2', text('Definitions'))),
      },
    ])

    expect(headings.map(({ id }) => id)).toEqual(['definitions', 'definitions-1'])
  })

  it('skips empty headings and untitled blocks without rich text', () => {
    expect(
      extractHeadings([
        {
          blockType: BlockSlug.Code,
        },
        {
          blockType: BlockSlug.RichText,
          content: doc(heading('h2', text('  '))),
        },
      ]),
    ).toEqual([])
  })
})

describe('getBlockAnchors', () => {
  it('splits a block list extraction into per-block anchor props', () => {
    const headings = extractHeadings([
      {
        blockType: BlockSlug.RichText,
        title: 'FAQ',
        content: doc(heading('h2', text('Billing')), heading('h2', text('FAQ'))),
      },
      {
        blockType: BlockSlug.ResumeContact,
        title: 'Contact',
      },
    ])

    expect(getBlockAnchors(headings, 0)).toEqual({
      anchorId: 'faq',
      headingIds: ['billing', 'faq-1'],
    })
    expect(getBlockAnchors(headings, 1)).toEqual({
      anchorId: 'contact',
      headingIds: [],
    })
  })
})
