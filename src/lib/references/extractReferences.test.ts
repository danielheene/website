import { describe, expect, it } from 'vitest'

import { extractReferences } from './extractReferences'

describe('extractReferences', () => {
  it('finds a polymorphic upload reference with a bare id', () => {
    expect(
      extractReferences({
        heroImage: {
          relationTo: 'images',
          value: 'img-1',
        },
      }),
    ).toEqual([
      {
        relationTo: 'images',
        value: 'img-1',
        path: 'heroImage',
      },
    ])
  })

  it('resolves populated documents to their id', () => {
    const [reference] = extractReferences({
      heroImage: {
        relationTo: 'images',
        value: {
          id: 'img-2',
          url: '/img.png',
        },
      },
    })
    expect(reference.value).toBe('img-2')
  })

  it('finds references nested in arrays and blocks', () => {
    const references = extractReferences({
      layout: [
        {
          blockType: 'gallery',
          items: [
            {
              media: {
                relationTo: 'images',
                value: 'img-a',
              },
            },
            {
              media: {
                relationTo: 'videos',
                value: 'vid-a',
              },
            },
          ],
        },
      ],
    })

    expect(references).toHaveLength(2)
    expect(references.map(({ value }) => value)).toEqual([
      'img-a',
      'vid-a',
    ])
    expect(references[0].path).toBe('layout.0.items.0.media')
  })

  it('finds Lexical upload nodes inside rich text', () => {
    const references = extractReferences({
      content: {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [],
            },
            {
              type: 'upload',
              relationTo: 'images',
              value: 'img-lexical',
            },
            {
              type: 'upload',
              relationTo: 'videos',
              value: 'vid-lexical',
            },
          ],
        },
      },
    })

    expect(references.map(({ relationTo, value }) => `${relationTo}:${value}`)).toEqual([
      'images:img-lexical',
      'videos:vid-lexical',
    ])
  })

  it('deduplicates repeated references to the same target', () => {
    const references = extractReferences({
      a: {
        relationTo: 'images',
        value: 'img-dup',
      },
      b: {
        relationTo: 'images',
        value: 'img-dup',
      },
    })

    expect(references).toHaveLength(1)
    expect(references[0].path).toBe('a')
  })

  it('tracks every relationship by default, not just media', () => {
    const references = extractReferences({
      topics: [
        {
          relationTo: 'topics',
          value: 'topic-1',
        },
      ],
      author: {
        relationTo: 'users',
        value: 'user-1',
      },
    })

    expect(references.map(({ relationTo }) => relationTo)).toEqual([
      'topics',
      'users',
    ])
  })

  it('restricts results to the collections named in `only`', () => {
    const references = extractReferences(
      {
        hero: {
          relationTo: 'images',
          value: 'img-1',
        },
        topics: [
          {
            relationTo: 'topics',
            value: 'topic-1',
          },
        ],
      },
      {
        only: [
          'images',
        ],
      },
    )

    expect(references).toHaveLength(1)
    expect(references[0].relationTo).toBe('images')
  })

  it('resolves monomorphic relationships from the field config', () => {
    const references = extractReferences(
      {
        jobId: 'job-1',
        unrelated: 'not-a-relation',
      },
      {
        fields: [
          {
            name: 'jobId',
            type: 'relationship',
            relationTo: 'payload-jobs',
          },
          {
            name: 'unrelated',
            type: 'text',
          },
        ] as never,
      },
    )

    expect(references).toEqual([
      {
        relationTo: 'payload-jobs',
        value: 'job-1',
        path: 'jobId',
      },
    ])
  })

  it('resolves monomorphic relationships nested in arrays and groups', () => {
    const references = extractReferences(
      {
        group: {
          items: [
            {
              relatedPost: 'post-1',
            },
            {
              relatedPost: 'post-2',
            },
          ],
        },
      },
      {
        fields: [
          {
            name: 'group',
            type: 'group',
            fields: [
              {
                name: 'items',
                type: 'array',
                fields: [
                  {
                    name: 'relatedPost',
                    type: 'relationship',
                    relationTo: 'posts',
                  },
                ],
              },
            ],
          },
        ] as never,
      },
    )

    expect(references.map(({ value }) => value)).toEqual([
      'post-1',
      'post-2',
    ])
  })

  it('resolves a populated monomorphic relationship to its id', () => {
    const references = extractReferences(
      {
        author: {
          id: 'user-9',
          email: 'a@b.test',
        },
      },
      {
        fields: [
          {
            name: 'author',
            type: 'relationship',
            relationTo: 'users',
          },
        ] as never,
      },
    )

    expect(references).toEqual([
      {
        relationTo: 'users',
        value: 'user-9',
        path: 'author',
      },
    ])
  })

  it('resolves monomorphic fields in blocks referenced by slug', () => {
    const references = extractReferences(
      {
        content: [
          {
            blockType: 'HeroBlock',
            relatedPost: 'post-1',
          },
        ],
      },
      {
        // the pattern Pages uses: an empty `blocks` array plus slug references
        fields: [
          {
            name: 'content',
            type: 'blocks',
            blocks: [],
            blockReferences: [
              'HeroBlock',
            ],
          },
        ] as never,
        blocks: [
          {
            slug: 'HeroBlock',
            fields: [
              {
                name: 'relatedPost',
                type: 'relationship',
                relationTo: 'posts',
              },
            ],
          },
        ] as never,
      },
    )

    expect(references).toEqual([
      {
        relationTo: 'posts',
        value: 'post-1',
        path: 'content.0.relatedPost',
      },
    ])
  })

  it('resolves an inline block object listed in blockReferences', () => {
    const references = extractReferences(
      {
        content: [
          {
            blockType: 'HeroBlock',
            portrait: 'img-1',
          },
        ],
      },
      {
        fields: [
          {
            name: 'content',
            type: 'blocks',
            blocks: [],
            blockReferences: [
              {
                slug: 'HeroBlock',
                fields: [
                  {
                    name: 'portrait',
                    type: 'upload',
                    relationTo: 'images',
                  },
                ],
              },
            ],
          },
        ] as never,
      },
    )

    expect(references.map(({ relationTo, value }) => `${relationTo}:${value}`)).toEqual([
      'images:img-1',
    ])
  })

  it('terminates on a block that transitively contains itself', () => {
    const references = extractReferences(
      {
        content: [
          {
            blockType: 'SelfBlock',
            relatedPost: 'post-1',
          },
        ],
      },
      {
        fields: [
          {
            name: 'content',
            type: 'blocks',
            blocks: [],
            blockReferences: [
              'SelfBlock',
            ],
          },
        ] as never,
        blocks: [
          {
            slug: 'SelfBlock',
            fields: [
              {
                name: 'relatedPost',
                type: 'relationship',
                relationTo: 'posts',
              },
              {
                name: 'nested',
                type: 'blocks',
                blocks: [],
                blockReferences: [
                  'SelfBlock',
                ],
              },
            ],
          },
        ] as never,
      },
    )

    expect(references).toHaveLength(1)
  })

  it('ignores a blockReferences slug with no matching definition', () => {
    expect(
      extractReferences(
        {
          content: [
            {
              blockType: 'MissingBlock',
              relatedPost: 'post-1',
            },
          ],
        },
        {
          fields: [
            {
              name: 'content',
              type: 'blocks',
              blocks: [],
              blockReferences: [
                'MissingBlock',
              ],
            },
          ] as never,
          blocks: [] as never,
        },
      ),
    ).toEqual([])
  })

  it('ignores bare ids when no field config identifies them', () => {
    expect(
      extractReferences({
        jobId: 'job-1',
      }),
    ).toEqual([])
  })

  it('finds media nested inside a populated media document', () => {
    const references = extractReferences({
      video: {
        relationTo: 'videos',
        value: {
          id: 'vid-1',
          thumbnails: [
            {
              relationTo: 'images',
              value: 'thumb-1',
            },
          ],
        },
      },
    })

    expect(references.map(({ value }) => value)).toEqual([
      'vid-1',
      'thumb-1',
    ])
  })

  it('handles empty, null and primitive input', () => {
    expect(extractReferences(null)).toEqual([])
    expect(extractReferences(undefined)).toEqual([])
    expect(extractReferences('string')).toEqual([])
    expect(extractReferences({})).toEqual([])
  })

  it('ignores relations with a missing or malformed value', () => {
    expect(
      extractReferences({
        a: {
          relationTo: 'images',
          value: null,
        },
        b: {
          relationTo: 'images',
        },
        c: {
          relationTo: 'images',
          value: {},
        },
      }),
    ).toEqual([])
  })
})
