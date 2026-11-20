import { describe, expect, it } from 'vitest'

import { attributionText, resolveAttribution } from './attribution'

const notes = (text: string) => ({
  root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text }] }] },
})

describe('resolveAttribution', () => {
  it('resolves author, studio and the license label and URL', () => {
    expect(
      resolveAttribution({
        authorName: ' Jane ',
        authorURL: 'https://jane.test',
        studioName: 'Unsplash',
        studioURL: '',
        license: 'unsplash',
      }),
    ).toEqual({
      author: { name: 'Jane', url: 'https://jane.test' },
      studio: { name: 'Unsplash' },
      license: {
        value: 'unsplash',
        label: 'Unsplash License',
        url: 'https://unsplash.com/license',
      },
    })
  })

  it('counts notes only when they hold text', () => {
    expect(resolveAttribution({ notes: notes('Courtesy of X') })?.notes).toEqual(
      notes('Courtesy of X'),
    )
    expect(resolveAttribution({ notes: notes('  ') })).toBeNull()
  })

  it('is null when nobody is credited, even with a license', () => {
    expect(resolveAttribution({ license: 'cc0-1.0' })).toBeNull()
    expect(resolveAttribution(null)).toBeNull()
  })

  it('ignores unknown licenses', () => {
    expect(resolveAttribution({ authorName: 'Jane', license: 'nope' })).toEqual({
      author: { name: 'Jane' },
    })
  })
})

describe('attributionText', () => {
  it('joins author and studio', () => {
    expect(attributionText({ author: { name: 'Jane' }, studio: { name: 'Unsplash' } })).toBe(
      'Jane / Unsplash',
    )
    expect(attributionText({ notes: {} })).toBeUndefined()
  })
})
