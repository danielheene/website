import { describe, expect, it } from 'vitest'

import { processIncomingFlags } from './processIncomingFlags'

const run = (args: { previousValue?: unknown; value?: unknown }) =>
  processIncomingFlags(args as never) as Promise<string[]>

describe('processIncomingFlags', () => {
  it('adds flags with the + operator', async () => {
    expect(
      await run({
        previousValue: [],
        value: [
          '+foo',
        ],
      }),
    ).toEqual([
      'foo',
    ])
  })

  it('removes flags with the - operator', async () => {
    expect(
      await run({
        previousValue: [
          'foo',
          'bar',
        ],
        value: [
          '-foo',
        ],
      }),
    ).toEqual([
      'bar',
    ])
  })

  it('applies add and remove in order', async () => {
    expect(
      await run({
        previousValue: [
          'a',
        ],
        value: [
          '+b',
          '-a',
        ],
      }),
    ).toEqual([
      'b',
    ])
  })

  it('deduplicates flags', async () => {
    expect(
      await run({
        previousValue: [
          'a',
        ],
        value: [
          '+a',
          '+a',
        ],
      }),
    ).toEqual([
      'a',
    ])
  })

  it('returns previous flags unchanged for empty or missing value', async () => {
    expect(
      await run({
        previousValue: [
          'a',
        ],
      }),
    ).toEqual([
      'a',
    ])
    expect(
      await run({
        previousValue: [
          'a',
        ],
        value: [],
      }),
    ).toEqual([
      'a',
    ])
  })

  it('returns an empty array with no previous value', async () => {
    expect(await run({})).toEqual([])
  })

  it('ignores entries without an operator prefix (latent filter bug)', async () => {
    // NOTE: `isArray(value) && value.filter(isFlagOperator) ? value : []`
    // always evaluates truthy for arrays (filter returns an array), so
    // non-operator strings are NOT filtered out — they just fall through the
    // reducer's final `return prev`. Pinning observed behavior.
    expect(
      await run({
        previousValue: [
          'a',
        ],
        value: [
          'plain',
        ],
      }),
    ).toEqual([
      'a',
    ])
  })
})
