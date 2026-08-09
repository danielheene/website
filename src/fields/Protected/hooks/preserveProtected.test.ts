import { describe, expect, it } from 'vitest'

import { preserveProtected } from './preserveProtected'

const run = (args: { operation?: string; previousValue?: unknown; value?: unknown }) =>
  preserveProtected(args as never)

describe('preserveProtected', () => {
  it('keeps a protected document protected when an update tries to clear it', () => {
    expect(
      run({
        operation: 'update',
        previousValue: true,
        value: false,
      }),
    ).toBe(true)
  })

  it('does not let an update protect an unprotected document', () => {
    expect(
      run({
        operation: 'update',
        previousValue: false,
        value: true,
      }),
    ).toBe(false)
  })

  it('treats a missing previous value as unprotected on update', () => {
    expect(
      run({
        operation: 'update',
        previousValue: undefined,
        value: true,
      }),
    ).toBe(false)
  })

  it('ignores the incoming value on update even when it matches', () => {
    expect(
      run({
        operation: 'update',
        previousValue: true,
        value: true,
      }),
    ).toBe(true)
  })

  it('defaults to unprotected on create', () => {
    expect(
      run({
        operation: 'create',
        value: undefined,
      }),
    ).toBe(false)
  })

  it('does not let a create request protect a new document', () => {
    expect(
      run({
        operation: 'create',
        value: true,
      }),
    ).toBe(false)
  })

  it('does not carry the flag onto a duplicated document', () => {
    expect(
      run({
        operation: 'create',
        previousValue: true,
        value: true,
      }),
    ).toBe(false)
  })

  it('always returns a boolean so the required field never receives undefined', () => {
    expect(
      run({
        operation: 'update',
        previousValue: undefined,
        value: undefined,
      }),
    ).toBe(false)
  })
})
