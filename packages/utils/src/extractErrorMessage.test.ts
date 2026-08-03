import { describe, expect, it } from 'vitest'

import { extractErrorMessage, isErrorWithMessage, toErrorWithMessage } from './extractErrorMessage'

describe('isErrorWithMessage', () => {
  it('accepts Error instances', () => {
    expect(isErrorWithMessage(new Error('boom'))).toBe(true)
  })

  it('accepts plain objects with a string message', () => {
    expect(
      isErrorWithMessage({
        message: 'boom',
      }),
    ).toBe(true)
  })

  it('rejects objects with a non-string message', () => {
    expect(
      isErrorWithMessage({
        message: 1,
      }),
    ).toBe(false)
  })

  it('rejects null, undefined and primitives', () => {
    expect(isErrorWithMessage(null)).toBe(false)
    expect(isErrorWithMessage(undefined)).toBe(false)
    expect(isErrorWithMessage('boom')).toBe(false)
    expect(isErrorWithMessage(42)).toBe(false)
  })
})

describe('toErrorWithMessage', () => {
  it('passes through values that already have a message', () => {
    const error = new Error('boom')
    expect(toErrorWithMessage(error)).toBe(error)
  })

  it('stringifies plain values', () => {
    expect(
      toErrorWithMessage({
        a: 1,
      }).message,
    ).toBe('{"a":1}')
    expect(toErrorWithMessage('boom').message).toBe('"boom"')
  })

  it('falls back to String() for circular references', () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular
    expect(toErrorWithMessage(circular).message).toBe('[object Object]')
  })
})

describe('extractErrorMessage', () => {
  it('extracts the message from an Error', () => {
    expect(extractErrorMessage(new Error('boom'))).toBe('boom')
  })

  it('stringifies non-error values', () => {
    expect(
      extractErrorMessage({
        code: 500,
      }),
    ).toBe('{"code":500}')
  })
})
