import { describe, expect, it } from 'vitest'

import { type LinkTargetOptionGroup, linkTargetOptionValue } from './fetchLinkTargetOptions'
import { resolveTitleFromOptions } from './resolveTitleFromOptions'

const optionGroups: LinkTargetOptionGroup[] = [
  {
    label: 'Pages',
    options: [
      {
        label: 'About us',
        value: linkTargetOptionValue('pages', 'page-1'),
        relationTo: 'pages',
        docID: 'page-1',
      },
    ],
  },
  {
    label: 'Blog Posts',
    options: [
      {
        label: 'Hello world',
        value: linkTargetOptionValue('posts', 'post-1'),
        relationTo: 'posts',
        docID: 'post-1',
      },
    ],
  },
]

describe('resolveTitleFromOptions', () => {
  it('returns the option label for an unpopulated reference in the list', () => {
    expect(
      resolveTitleFromOptions(
        optionGroups,
        {
          relationTo: 'pages',
          value: 'page-1',
        },
        null,
      ),
    ).toBe('About us')
  })

  it('returns the option label for a populated reference in the list', () => {
    expect(
      resolveTitleFromOptions(
        optionGroups,
        {
          relationTo: 'posts',
          value: {
            id: 'post-1',
            title: 'Hello world',
          },
        },
        null,
      ),
    ).toBe('Hello world')
  })

  it('reads the id of a populated reference rather than stringifying the object', () => {
    expect(
      resolveTitleFromOptions(
        optionGroups,
        {
          relationTo: 'pages',
          value: {
            id: 'page-1',
            title: 'Stale populated title',
          },
        },
        null,
      ),
    ).toBe('About us')
  })

  it('falls back for an unpopulated reference missing from the list', () => {
    expect(
      resolveTitleFromOptions(
        optionGroups,
        {
          relationTo: 'pages',
          value: 'page-999',
        },
        null,
      ),
    ).toBe('')
  })

  it('falls back to the populated title for a reference missing from the list', () => {
    const title = resolveTitleFromOptions(
      optionGroups,
      {
        relationTo: 'pages',
        value: {
          id: 'page-999',
          title: 'Deleted page',
        },
      },
      null,
    )

    expect(title).not.toBe('[object Object]')
    expect(title).toBe('Deleted page')
  })

  it('returns the hostname of a custom URL', () => {
    expect(resolveTitleFromOptions(optionGroups, null, 'https://example.com/deep/path')).toBe(
      'example.com',
    )
  })

  it('returns an empty string when nothing is selected', () => {
    expect(resolveTitleFromOptions(optionGroups, null, null)).toBe('')
    expect(resolveTitleFromOptions(optionGroups, undefined, undefined)).toBe('')
    expect(resolveTitleFromOptions([], null, null)).toBe('')
  })

  it('prefers a listed reference over a url set alongside it', () => {
    expect(
      resolveTitleFromOptions(
        optionGroups,
        {
          relationTo: 'pages',
          value: 'page-1',
        },
        'https://example.com',
      ),
    ).toBe('About us')
  })

  it('prefers an unlisted reference over a url set alongside it', () => {
    expect(
      resolveTitleFromOptions(
        optionGroups,
        {
          relationTo: 'pages',
          value: {
            id: 'page-999',
            title: 'Deleted page',
          },
        },
        'https://example.com',
      ),
    ).toBe('Deleted page')
  })
})
