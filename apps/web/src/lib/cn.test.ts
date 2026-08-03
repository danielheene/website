import { describe, expect, it } from 'vitest'

import { cn } from './cn'

describe('cn', () => {
  it('merges conflicting tailwind classes, last one wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('keeps non-conflicting classes', () => {
    expect(cn('p-2', 'mt-4')).toBe('p-2 mt-4')
  })

  it('filters falsy values', () => {
    expect(cn('a', false, undefined, null, '', 'b')).toBe('a b')
  })

  it('flattens array inputs', () => {
    expect(
      cn(
        [
          'a',
          'b',
        ],
        'c',
      ),
    ).toBe('a b c')
  })

  it('returns an empty string for no input', () => {
    expect(cn()).toBe('')
  })
})
