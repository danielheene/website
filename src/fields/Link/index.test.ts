// src/fields/Link/index.test.ts
import type { Field } from 'payload'

import { describe, expect, it } from 'vitest'

import { LinkField } from './index'

const flatten = (fields: Field[]): Field[] =>
  fields.flatMap((field) =>
    'fields' in field && Array.isArray(field.fields)
      ? flatten(field.fields as Field[])
      : [
          field,
        ],
  )

const named = (name: string) =>
  flatten(LinkField().fields).find((field) => 'name' in field && field.name === name)

describe('LinkField', () => {
  it('no longer exposes appearance, resolvedLabel, or the old type/icon fields', () => {
    expect(named('appearance')).toBeUndefined()
    expect(named('resolvedLabel')).toBeUndefined()
    expect(named('type')).toBeUndefined()
    expect(named('icon')).toBeUndefined()
  })

  it('exposes both icon slots', () => {
    expect(named('iconBefore')).toBeDefined()
    expect(named('iconAfter')).toBeDefined()
  })

  it('exposes linkType as a required select defaulting to internal', () => {
    expect(named('linkType')).toMatchObject({
      type: 'select',
      required: true,
      defaultValue: 'internal',
      options: expect.arrayContaining([
        expect.objectContaining({
          value: 'internal',
        }),
        expect.objectContaining({
          value: 'custom',
        }),
      ]),
    })
  })

  it('label is a plain required text field with no default value', () => {
    const label = named('label')

    expect(label).toMatchObject({
      type: 'text',
      required: true,
    })
    expect(label).not.toHaveProperty('defaultValue')
    expect(label?.admin?.components).toBeUndefined()
  })

  it('doc is shown only when linkType resolves to internal', () => {
    const doc = named('doc')
    if (!doc) {
      throw new Error('doc field not found')
    }
    const { condition } = doc.admin as {
      condition: (data: unknown, siblingData: Record<string, unknown>) => boolean
    }

    expect(doc).toMatchObject({
      type: 'relationship',
      relationTo: [
        'pages',
        'posts',
        'topics',
      ],
    })
    expect(doc?.admin?.components).toBeUndefined()

    expect(
      condition(null, {
        linkType: 'internal',
      }),
    ).toBe(true)
    expect(
      condition(null, {
        linkType: 'custom',
      }),
    ).toBe(false)
    // legacy data: no linkType, but a url is set -> infers 'custom', hides doc
    expect(
      condition(null, {
        url: 'https://example.com',
      }),
    ).toBe(false)
    // legacy data: no linkType, no url -> infers 'internal', shows doc
    expect(condition(null, {})).toBe(true)
  })

  it('url is shown only when linkType resolves to custom', () => {
    const url = named('url')
    if (!url) {
      throw new Error('url field not found')
    }
    const { condition } = url.admin as {
      condition: (data: unknown, siblingData: Record<string, unknown>) => boolean
    }

    expect(url).toMatchObject({
      type: 'text',
      label: 'Custom URL',
    })
    expect(
      condition(null, {
        linkType: 'custom',
      }),
    ).toBe(true)
    expect(
      condition(null, {
        linkType: 'internal',
      }),
    ).toBe(false)
  })

  it('doc and url each validate only when they are the active mode', () => {
    const doc = named('doc')
    const url = named('url')
    if (!doc) {
      throw new Error('doc field not found')
    }
    if (!url) {
      throw new Error('url field not found')
    }

    const docValidate = (
      doc as {
        validate: unknown
      }
    ).validate as (
      value: unknown,
      args: {
        siblingData: Record<string, unknown>
      },
    ) => string | true
    const urlValidate = (
      url as {
        validate: unknown
      }
    ).validate as (
      value: unknown,
      args: {
        siblingData: Record<string, unknown>
      },
    ) => string | true

    expect(
      docValidate(null, {
        siblingData: {
          linkType: 'internal',
        },
      }),
    ).toEqual(expect.any(String))
    expect(
      docValidate(
        {
          relationTo: 'pages',
          value: 'p1',
        },
        {
          siblingData: {
            linkType: 'internal',
          },
        },
      ),
    ).toBe(true)
    // Not the active mode: an empty doc must not block save.
    expect(
      docValidate(null, {
        siblingData: {
          linkType: 'custom',
        },
      }),
    ).toBe(true)

    expect(
      urlValidate(null, {
        siblingData: {
          linkType: 'custom',
        },
      }),
    ).toEqual(expect.any(String))
    expect(
      urlValidate('https://example.com', {
        siblingData: {
          linkType: 'custom',
        },
      }),
    ).toBe(true)
    // Not the active mode: an empty url must not block save.
    expect(
      urlValidate(null, {
        siblingData: {
          linkType: 'internal',
        },
      }),
    ).toBe(true)
    // Active mode, invalid url: still rejected.
    expect(
      urlValidate('not a url', {
        siblingData: {
          linkType: 'custom',
        },
      }),
    ).toEqual(expect.any(String))
  })

  it('iconAfter is hidden when iconOnly is checked', () => {
    const iconAfter = named('iconAfter')
    if (!iconAfter) {
      throw new Error('iconAfter field not found')
    }
    const { condition } = iconAfter.admin as {
      condition: (data: unknown, siblingData: Record<string, unknown>) => boolean
    }

    expect(
      condition(null, {
        iconOnly: true,
      }),
    ).toBe(false)
    expect(
      condition(null, {
        iconOnly: false,
      }),
    ).toBe(true)
    expect(condition(null, {})).toBe(true)
  })
})
