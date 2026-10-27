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
  it('generates a slug from the source field on create when published', () => {
    expect(
      run('title', {
        operation: 'create',
        value: '',
        data: {
          title: 'Hello World',
          _status: 'published',
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
          _status: 'published',
        },
      }),
    ).toBe('nested-title')
  })

  it('generates a slug on update when published and slug is not provided yet', () => {
    expect(
      run('title', {
        operation: 'update',
        value: '',
        data: {
          title: 'Published On Update',
          _status: 'published',
        },
      }),
    ).toBe('published-on-update')
  })

  it('does not generate a slug on draft create or update', () => {
    expect(
      run('title', {
        operation: 'create',
        value: '',
        data: {
          title: 'Draft Post',
          _status: 'draft',
        },
      }),
    ).toBe('')

    expect(
      run('title', {
        operation: 'update',
        value: '',
        data: {
          title: 'Draft Post',
          _status: 'draft',
        },
      }),
    ).toBe('')
  })

  it('keeps an existing value on create', () => {
    expect(
      run('title', {
        operation: 'create',
        value: 'custom-slug',
        data: {
          title: 'Hello',
          _status: 'published',
        },
      }),
    ).toBe('custom-slug')
  })

  it('keeps an existing value on update and does not regenerate when slug is already set', () => {
    expect(
      run('title', {
        operation: 'update',
        value: 'existing-slug',
        data: {
          title: 'New Title',
          _status: 'published',
        },
      }),
    ).toBe('existing-slug')
  })

  it('returns the original value when the source field is missing or not a string', () => {
    expect(
      run('title', {
        operation: 'create',
        value: '',
        data: {
          _status: 'published',
        },
      }),
    ).toBe('')
    expect(
      run('title', {
        operation: 'create',
        value: '',
        data: {
          title: 42,
          _status: 'published',
        },
      }),
    ).toBe('')
  })

  it('handles missing or undefined data safely', () => {
    expect(
      run('title', {
        operation: 'create',
        value: 'original',
        data: undefined,
      }),
    ).toBe('original')
  })
})
