import type { BaseFilter, Where } from 'payload'

import { describe, expect, it } from 'vitest'

import { MEDIA_SCOPE_PARAM, MediaScope, resolveMediaScope, scopeMediaAssets } from './baseFilter'
import { GENERATOR_FLAGS } from './index'

type BaseFilterArgs = Parameters<BaseFilter>[0]

const withScope = (scope?: unknown) =>
  ({
    req: {
      query:
        scope === undefined
          ? {}
          : {
              [MEDIA_SCOPE_PARAM]: scope,
            },
    },
  }) as unknown as BaseFilterArgs

describe('resolveMediaScope', () => {
  it('passes through every known scope', () => {
    for (const scope of Object.values(MediaScope)) {
      expect(resolveMediaScope(scope)).toBe(scope)
    }
  })

  it('falls back to uploaded for absent, unknown, or non-string values', () => {
    for (const value of [
      undefined,
      null,
      '',
      'nope',
      // Repeated query params arrive as arrays.
      [
        MediaScope.All,
      ],
      1,
      true,
    ]) {
      expect(resolveMediaScope(value)).toBe(MediaScope.Uploaded)
    }
  })
})

describe('scopeMediaAssets', () => {
  it('hides generated assets by default', () => {
    expect(scopeMediaAssets(withScope())).toEqual({
      generatorFlags: {
        not_in: [
          ...GENERATOR_FLAGS,
        ],
      },
    })
  })

  it('hides generated assets for an unknown scope', () => {
    expect(scopeMediaAssets(withScope('nope'))).toEqual(scopeMediaAssets(withScope()))
  })

  it('shows only generated assets for the generated scope', () => {
    expect(scopeMediaAssets(withScope(MediaScope.Generated))).toEqual({
      generatorFlags: {
        in: [
          ...GENERATOR_FLAGS,
        ],
      },
    })
  })

  it('applies no filter for the all scope', () => {
    expect(scopeMediaAssets(withScope(MediaScope.All))).toBeNull()
  })

  it('splits the collection cleanly between uploaded and generated', () => {
    // The two scopes must be exact complements, or assets would go missing from
    // both tabs — the operators differ, the flag list must not.
    const uploaded = scopeMediaAssets(withScope(MediaScope.Uploaded)) as Where
    const generated = scopeMediaAssets(withScope(MediaScope.Generated)) as Where

    expect(uploaded.generatorFlags).toHaveProperty('not_in')
    expect(generated.generatorFlags).toHaveProperty('in')
    expect(Object.values(uploaded.generatorFlags as object)[0]).toEqual(
      Object.values(generated.generatorFlags as object)[0],
    )
  })

  it('tolerates a request without a query', () => {
    expect(
      scopeMediaAssets({
        req: {},
      } as unknown as BaseFilterArgs),
    ).toEqual(scopeMediaAssets(withScope()))
  })
})
