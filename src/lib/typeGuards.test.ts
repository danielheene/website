import { describe, expect, it } from 'vitest'

import {
  isHeroMedia,
  isHeroMediaArray,
  isMediaAudio,
  isMediaDocument,
  isMediaImage,
  isMediaImageReference,
  isMediaObject,
  isMediaVideo,
  isMediaVideoReference,
} from './typeGuards'

const image = {
  mimeType: 'image/png',
  url: '/img.png',
}
const video = {
  mimeType: 'video/mp4',
}
const doc = {
  mimeType: 'application/pdf',
}
const audio = {
  mimeType: 'audio/mpeg',
}

describe('isMediaObject', () => {
  it('accepts objects with a string mimeType', () => {
    expect(isMediaObject(image)).toBe(true)
  })

  it('rejects non-objects and missing/invalid mimeType', () => {
    expect(isMediaObject(null)).toBeFalsy()
    expect(isMediaObject('image/png')).toBeFalsy()
    expect(isMediaObject({})).toBeFalsy()
    expect(
      isMediaObject({
        mimeType: 5,
      }),
    ).toBeFalsy()
  })
})

describe('mime type guards', () => {
  it('discriminates by mime type prefix', () => {
    expect(isMediaImage(image)).toBe(true)
    expect(isMediaImage(video)).toBe(false)
    expect(isMediaVideo(video)).toBe(true)
    expect(isMediaVideo(doc)).toBe(false)
    expect(isMediaDocument(doc)).toBe(true)
    expect(isMediaDocument(audio)).toBe(false)
    expect(isMediaAudio(audio)).toBe(true)
    expect(isMediaAudio(image)).toBe(false)
  })
})

describe('isHeroMedia', () => {
  it('accepts images and videos only', () => {
    expect(isHeroMedia(image)).toBe(true)
    expect(isHeroMedia(video)).toBe(true)
    expect(isHeroMedia(doc)).toBe(false)
    expect(isHeroMedia(audio)).toBe(false)
  })
})

describe('isHeroMediaArray', () => {
  it('accepts non-empty arrays of hero media', () => {
    expect(
      isHeroMediaArray([
        image,
        video,
      ]),
    ).toBe(true)
  })

  it('rejects empty arrays', () => {
    expect(isHeroMediaArray([])).toBe(false)
  })

  it('rejects arrays containing non-hero media', () => {
    expect(
      isHeroMediaArray([
        image,
        doc,
      ]),
    ).toBe(false)
  })
})

describe('reference guards', () => {
  it('accepts matching referenceTo and value', () => {
    expect(
      isMediaImageReference({
        referenceTo: 'images',
        value: image,
      }),
    ).toBe(true)
    expect(
      isMediaVideoReference({
        referenceTo: 'videos',
        value: video,
      }),
    ).toBe(true)
  })

  it('rejects a wrong referenceTo', () => {
    expect(
      isMediaImageReference({
        referenceTo: 'videos',
        value: image,
      }),
    ).toBe(false)
    expect(
      isMediaVideoReference({
        referenceTo: 'images',
        value: video,
      }),
    ).toBe(false)
  })

  it('rejects a mismatched value', () => {
    expect(
      isMediaImageReference({
        referenceTo: 'images',
        value: video,
      }),
    ).toBe(false)
    expect(isMediaImageReference(null)).toBeFalsy()
  })
})
