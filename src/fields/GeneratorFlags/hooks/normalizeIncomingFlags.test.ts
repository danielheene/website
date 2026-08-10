import { describe, expect, it } from 'vitest'

import { normalizeIncomingFlags } from './normalizeIncomingFlags'

const run = (value?: unknown) =>
  normalizeIncomingFlags({
    value,
  } as never) as Promise<string[]>

describe('normalizeIncomingFlags', () => {
  it('keeps plain flags as given', async () => {
    expect(
      await run([
        'resume-asset',
        'thumbnail',
      ]),
    ).toEqual([
      'resume-asset',
      'thumbnail',
    ])
  })

  it('strips legacy +/- operator prefixes', async () => {
    expect(
      await run([
        '+resume-asset',
        '-thumbnail',
      ]),
    ).toEqual([
      'resume-asset',
      'thumbnail',
    ])
  })

  it('collapses a prefixed and plain spelling of the same flag', async () => {
    expect(
      await run([
        '+thumbnail',
        'thumbnail',
      ]),
    ).toEqual([
      'thumbnail',
    ])
  })

  it('deduplicates', async () => {
    expect(
      await run([
        'a',
        'a',
        'b',
      ]),
    ).toEqual([
      'a',
      'b',
    ])
  })

  it('drops empty entries', async () => {
    expect(
      await run([
        '',
        '+',
        '  ',
        'a',
      ]),
    ).toEqual([
      'a',
    ])
  })

  it('returns an empty array for a missing or non-array value', async () => {
    expect(await run(undefined)).toEqual([])
    expect(await run('nope')).toEqual([])
  })
})
