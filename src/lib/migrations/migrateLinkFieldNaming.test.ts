import { describe, expect, it } from 'vitest'

import { migrateLinkFieldNaming } from './migrateLinkFieldNaming'

/**
 * `migrateLinkFieldNaming` is intentionally untyped (`unknown` in, `unknown`
 * out) — it walks arbitrary stored documents. Assertions here need to index
 * into that result, so this recursive JSON shape stands in for the real
 * Payload types the plan didn't want this pure module depending on.
 * Deliberately `any`-valued rather than a further-recursive union:
 * TypeScript can't narrow a `string | number | ... | object` union through a
 * chained `.a[0].b.c` access, and this file only ever indexes into
 * known-object test fixtures.
 */
type JSONObject = {
  // biome-ignore lint/suspicious/noExplicitAny: recursive JSON shape for test-only chained property access, see comment above
  [key: string]: any
}

describe('migrateLinkFieldNaming', () => {
  it('renames linkType "reference" to "internal" and reference to doc', () => {
    const { value, changed } = migrateLinkFieldNaming({
      link: {
        linkType: 'reference',
        reference: {
          relationTo: 'pages',
          value: 'p1',
        },
        label: 'About',
      },
    })

    expect(changed).toBe(1)
    expect(value).toEqual({
      link: {
        linkType: 'internal',
        doc: {
          relationTo: 'pages',
          value: 'p1',
        },
        label: 'About',
      },
    })
  })

  it('renames linkType "url" to "custom" and drops the reference key', () => {
    const { value, changed } = migrateLinkFieldNaming({
      link: {
        linkType: 'url',
        reference: null,
        url: 'https://example.com',
        label: 'Example',
      },
    })

    expect(changed).toBe(1)
    expect(value).toEqual({
      link: {
        linkType: 'custom',
        doc: null,
        url: 'https://example.com',
        label: 'Example',
      },
    })
  })

  it('rewrites links nested in block arrays', () => {
    const { value, changed } = migrateLinkFieldNaming({
      layout: [
        {
          blockType: 'LinkGroupBlock',
          links: {
            entries: [
              {
                link: {
                  linkType: 'url',
                  reference: null,
                  label: 'One',
                  url: '/one',
                },
              },
              {
                link: {
                  linkType: 'reference',
                  reference: {
                    relationTo: 'posts',
                    value: 'post-1',
                  },
                  label: 'Two',
                },
              },
            ],
          },
        },
      ],
    })

    expect(changed).toBe(2)
    expect((value as JSONObject).layout[0].links.entries[0].link).toEqual({
      linkType: 'custom',
      doc: null,
      label: 'One',
      url: '/one',
    })
    expect((value as JSONObject).layout[0].links.entries[1].link).toEqual({
      linkType: 'internal',
      doc: {
        relationTo: 'posts',
        value: 'post-1',
      },
      label: 'Two',
    })
  })

  it('rewrites links inside lexical node json', () => {
    const { changed, value } = migrateLinkFieldNaming({
      content: {
        root: {
          children: [
            {
              type: 'link',
              fields: {
                linkType: 'reference',
                reference: {
                  relationTo: 'pages',
                  value: 'p1',
                },
              },
              children: [],
            },
          ],
        },
      },
    })

    expect(changed).toBe(1)
    expect((value as JSONObject).content.root.children[0].fields).toEqual({
      linkType: 'internal',
      doc: {
        relationTo: 'pages',
        value: 'p1',
      },
    })
  })

  it('is idempotent', () => {
    const migrated = migrateLinkFieldNaming({
      link: {
        linkType: 'internal',
        doc: {
          relationTo: 'pages',
          value: 'p1',
        },
        label: 'About',
      },
    })

    expect(migrated.changed).toBe(0)

    const again = migrateLinkFieldNaming(migrated.value)

    expect(again.changed).toBe(0)
    expect(again.value).toEqual(migrated.value)
  })

  it('does not overwrite an existing doc when both doc and reference are somehow present', () => {
    const { value } = migrateLinkFieldNaming({
      link: {
        linkType: 'internal',
        reference: {
          relationTo: 'pages',
          value: 'old',
        },
        doc: {
          relationTo: 'pages',
          value: 'new',
        },
        label: 'One',
      },
    })

    expect((value as JSONObject).link).toEqual({
      linkType: 'internal',
      doc: {
        relationTo: 'pages',
        value: 'new',
      },
      label: 'One',
    })
  })

  it('leaves non-link objects untouched', () => {
    const input = {
      meta: {
        reference: 'a',
        other: 'b',
      },
    }

    const { value, changed } = migrateLinkFieldNaming(input)

    expect(changed).toBe(0)
    expect(value).toEqual(input)
  })

  it('preserves non-plain values by reference', () => {
    class ObjectIdStub {
      constructor(readonly id: string) {}
    }

    const _id = new ObjectIdStub('abc')
    const createdAt = new Date('2026-01-01T00:00:00.000Z')

    const { value } = migrateLinkFieldNaming({
      _id,
      createdAt,
      link: {
        linkType: 'url',
        reference: null,
        label: 'One',
        url: '/one',
      },
    })

    const output = value as never as Record<string, unknown>

    expect(output._id).toBe(_id)
    expect(output.createdAt).toBe(createdAt)
  })
})
