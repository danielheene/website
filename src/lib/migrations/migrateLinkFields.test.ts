import { describe, expect, it } from 'vitest'

import { migrateLinkFields } from './migrateLinkFields'

/**
 * `migrateLinkFields` is intentionally untyped (`unknown` in, `unknown` out) —
 * it walks arbitrary stored documents. Assertions here need to index into
 * that result, so this recursive JSON shape stands in for the real Payload
 * types the plan didn't want this pure module depending on. Deliberately
 * `any`-valued rather than a further-recursive union: TypeScript can't narrow
 * a `string | number | ... | object` union through a chained `.a[0].b.c`
 * access, and this file only ever indexes into known-object test fixtures.
 */
type JSONObject = {
  // biome-ignore lint/suspicious/noExplicitAny: recursive JSON shape for test-only chained property access, see comment above
  [key: string]: any
}

describe('migrateLinkFields', () => {
  it('renames icon to iconBefore and drops type', () => {
    const { value, changed } = migrateLinkFields({
      link: {
        type: 'reference',
        icon: 'simple-icons:github',
        label: 'GitHub',
        url: 'https://github.com',
      },
    })

    expect(changed).toBe(1)
    expect(value).toEqual({
      link: {
        iconBefore: 'simple-icons:github',
        label: 'GitHub',
        url: 'https://github.com',
      },
    })
  })

  it('rewrites links nested in block arrays', () => {
    const { value, changed } = migrateLinkFields({
      layout: [
        {
          blockType: 'LinkGroupBlock',
          links: {
            entries: [
              {
                link: {
                  type: 'custom',
                  icon: 'a',
                  label: 'One',
                  url: '/one',
                },
              },
              {
                link: {
                  type: 'custom',
                  icon: 'b',
                  label: 'Two',
                  url: '/two',
                },
              },
            ],
          },
        },
      ],
    })

    expect(changed).toBe(2)
    expect((value as JSONObject).layout[0].links.entries[0].link).toEqual({
      iconBefore: 'a',
      label: 'One',
      url: '/one',
    })
  })

  it('rewrites links inside lexical node json', () => {
    const { changed, value } = migrateLinkFields({
      content: {
        root: {
          children: [
            {
              type: 'link',
              fields: {
                type: 'reference',
                icon: 'x',
                label: 'Docs',
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
      iconBefore: 'x',
      label: 'Docs',
      reference: {
        relationTo: 'pages',
        value: 'p1',
      },
    })
  })

  it('is idempotent', () => {
    const migrated = migrateLinkFields({
      link: {
        iconBefore: 'a',
        label: 'One',
        url: '/one',
      },
    })

    expect(migrated.changed).toBe(0)

    const again = migrateLinkFields(migrated.value)

    expect(again.changed).toBe(0)
    expect(again.value).toEqual(migrated.value)
  })

  it('does not overwrite an existing iconBefore', () => {
    const { value } = migrateLinkFields({
      link: {
        icon: 'old',
        iconBefore: 'new',
        label: 'One',
        url: '/one',
      },
    })

    expect((value as JSONObject).link).toEqual({
      iconBefore: 'new',
      label: 'One',
      url: '/one',
    })
  })

  it('leaves non-link objects untouched', () => {
    const input = {
      meta: {
        icon: 'a',
        type: 'b',
      },
    }

    const { value, changed } = migrateLinkFields(input)

    expect(changed).toBe(0)
    expect(value).toEqual(input)
  })

  it('preserves non-plain values by reference', () => {
    class ObjectIdStub {
      constructor(readonly id: string) {}
    }

    const _id = new ObjectIdStub('abc')
    const createdAt = new Date('2026-01-01T00:00:00.000Z')

    const { value } = migrateLinkFields({
      _id,
      createdAt,
      link: {
        icon: 'a',
        label: 'One',
        url: '/one',
      },
    })

    const output = value as never as Record<string, unknown>

    expect(output._id).toBe(_id)
    expect(output.createdAt).toBe(createdAt)
  })
})
