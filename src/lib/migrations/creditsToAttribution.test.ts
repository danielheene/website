import { describe, expect, it } from 'vitest'

import { attributionToCredits, creditsToAttribution } from './creditsToAttribution'

const text = (value: string) => ({ type: 'text', text: value })
const link = (value: string, url: string) => ({
  type: 'link',
  fields: { url },
  children: [text(value)],
})
const lexical = (...children: object[]) => ({
  root: { type: 'root', children: [{ type: 'paragraph', children }] },
})

describe('creditsToAttribution', () => {
  it('maps the Unsplash import format to author, platform and license', () => {
    const credits = lexical(
      link('Jane Doe', 'https://unsplash.com/@jane?utm_source=x'),
      text(' ['),
      link('Unsplash', 'https://unsplash.com/?utm_source=x'),
      text(']'),
    )

    expect(creditsToAttribution(credits)).toEqual({
      authorName: 'Jane Doe',
      authorURL: 'https://unsplash.com/@jane?utm_source=x',
      studioName: 'Unsplash',
      studioURL: 'https://unsplash.com/?utm_source=x',
      license: 'unsplash',
    })
  })

  it('handles connective text like "Photo by … on …" and "by … from …"', () => {
    expect(
      creditsToAttribution(
        lexical(
          text('Photo by '),
          link('Jane Doe', 'https://a.test'),
          text(' on '),
          link('Unsplash', 'https://unsplash.com'),
        ),
      ),
    ).not.toHaveProperty('notes')

    expect(
      creditsToAttribution(
        lexical(
          text('by '),
          link('Marcus Becker', 'mailto:m@b.test'),
          text(' from '),
          link('Sichtplan', 'https://sichtplan.test/'),
        ),
      ),
    ).toEqual({
      authorName: 'Marcus Becker',
      authorURL: 'mailto:m@b.test',
      studioName: 'Sichtplan',
      studioURL: 'https://sichtplan.test/',
    })
  })

  it('keeps the credit as notes when it holds more than the two links', () => {
    const credits = lexical(link('Jane Doe', 'https://a.test'), text(', edited by John Roe'))

    expect(creditsToAttribution(credits)).toEqual({
      authorName: 'Jane Doe',
      authorURL: 'https://a.test',
      notes: credits,
    })
  })

  it('keeps a credit without links as notes', () => {
    const credits = lexical(text('Courtesy of the archive'))

    expect(creditsToAttribution(credits)).toEqual({ notes: credits })
  })

  it('returns null for an empty credit', () => {
    expect(creditsToAttribution(lexical(text('  ')))).toBeNull()
    expect(creditsToAttribution(null)).toBeNull()
  })
})

describe('attributionToCredits', () => {
  it('prefers kept notes', () => {
    const credits = lexical(text('Courtesy of the archive'))

    expect(attributionToCredits({ authorName: 'Jane', notes: credits })).toBe(credits)
  })

  it('round-trips author and studio links', () => {
    const attribution = {
      authorName: 'Jane Doe',
      authorURL: 'https://a.test',
      studioName: 'Unsplash',
      studioURL: 'https://unsplash.com',
      license: 'unsplash',
    }

    expect(creditsToAttribution(attributionToCredits(attribution))).toEqual(attribution)
  })
})
