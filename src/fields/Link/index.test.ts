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
  it('no longer exposes the type radio or the single icon', () => {
    expect(named('type')).toBeUndefined()
    expect(named('icon')).toBeUndefined()
  })

  it('exposes both icon slots', () => {
    expect(named('iconBefore')).toBeDefined()
    expect(named('iconAfter')).toBeDefined()
  })

  it('defaults the label to the title template', () => {
    expect(named('label')).toMatchObject({
      defaultValue: '{title}',
    })
  })

  it('exposes resolvedLabel as a virtual field', () => {
    expect(named('resolvedLabel')).toMatchObject({
      virtual: true,
      type: 'text',
    })
  })

  it('hides the url field but keeps it in the schema', () => {
    const url = named('url')

    expect(url).toBeDefined()
    expect(url).toMatchObject({
      admin: {
        hidden: true,
      },
    })
  })

  it('requires exactly one of reference or url', () => {
    const reference = named('reference')
    const { validate } = reference as unknown as {
      validate: (
        value: unknown,
        args: {
          siblingData: Record<string, unknown>
        },
      ) => string | true
    }

    expect(
      validate(null, {
        siblingData: {},
      }),
    ).toEqual(expect.any(String))
    expect(
      validate(null, {
        siblingData: {
          url: 'https://example.com',
        },
      }),
    ).toBe(true)
    expect(
      validate(
        {
          relationTo: 'pages',
          value: 'p1',
        },
        {
          siblingData: {},
        },
      ),
    ).toBe(true)
  })

  it('omits the appearance select unless asked for it', () => {
    const withAppearance = flatten(
      LinkField({
        withAppearanceSelect: true,
      }).fields,
    ).find((field) => 'name' in field && field.name === 'appearance')

    expect(named('appearance')).toBeUndefined()
    expect(withAppearance).toBeDefined()
  })
})
