import { describe, expect, it } from 'vitest'

import { buildUnsplashAttribution } from './buildAttribution'

describe('buildUnsplashAttribution', () => {
  it('credits the photographer and Unsplash, both with UTM params, under the Unsplash License', () => {
    expect(
      buildUnsplashAttribution({
        photographerName: 'Jane Doe',
        photographerProfileUrl: 'https://unsplash.com/@jane',
      }),
    ).toEqual({
      authorName: 'Jane Doe',
      authorURL: 'https://unsplash.com/@jane?utm_source=heene_io&utm_medium=referral',
      studioName: 'Unsplash',
      studioURL: 'https://unsplash.com/?utm_source=heene_io&utm_medium=referral',
      license: 'unsplash',
    })
  })
})
