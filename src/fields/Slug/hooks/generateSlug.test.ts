import { describe, expect, it } from 'vitest'

import { generateSlugHook } from './generateSlug'

const run = (
  fieldToUse: string,
  args: {
    data?: Record<string, unknown>
    operation?: string
    value?: unknown
  },
) => generateSlugHook(fieldToUse)(args as never)

describe('generateSlugHook', () => {
  it('generates a slug from the source field on create', () => {
    expect(
      run('title', {
        operation: 'create',
        value: '',
        data: {
          title: 'Hello World',
        },
      }),
    ).toBe('hello-world')
  })

  it('supports nested source field paths', () => {
    expect(
      run('meta.title', {
        operation: 'create',
        value: undefined,
        data: {
          meta: {
            title: 'Nested Title',
          },
        },
      }),
    ).toBe('nested-title')
  })

  it('keeps an existing value on create', () => {
    expect(
      run('title', {
        operation: 'create',
        value: 'custom-slug',
        data: {
          title: 'Hello',
        },
      }),
    ).toBe('custom-slug')
  })

  it('never regenerates on update', () => {
    expect(
      run('title', {
        operation: 'update',
        value: '',
        data: {
          title: 'Hello',
        },
      }),
    ).toBe('')
  })

  it('returns the original value when the source field is missing or not a string', () => {
    expect(
      run('title', {
        operation: 'create',
        value: '',
        data: {},
      }),
    ).toBe('')
    expect(
      run('title', {
        operation: 'create',
        value: '',
        data: {
          title: 42,
        },
      }),
    ).toBe('')
  })
})
