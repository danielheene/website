import { describe, expect, it } from 'vitest'

import { HeroSlidesField } from './index'

describe('HeroSlidesField', () => {
  it('builds an array field with the given name', () => {
    const field = HeroSlidesField({
      name: 'slides',
    })

    expect(field.type).toBe('array')
    expect(field.name).toBe('slides')
  })

  it('requires at least one slide', () => {
    const field = HeroSlidesField({
      name: 'slides',
    })

    expect(field.minRows).toBe(1)
  })

  it('is unbounded by default', () => {
    const field = HeroSlidesField({
      name: 'slides',
    })

    expect(field.maxRows).toBeUndefined()
  })

  it('accepts a maxRows cap', () => {
    const field = HeroSlidesField({
      name: 'slides',
      maxRows: 1,
    })

    expect(field.maxRows).toBe(1)
  })

  it('registers the custom RowLabel component', () => {
    const field = HeroSlidesField({
      name: 'slides',
    })

    expect(field.admin?.components?.RowLabel).toMatchObject({
      path: '@/fields/HeroSlides/Components/RowLabel',
    })
  })

  it('includes a slideType select defaulting to image', () => {
    const field = HeroSlidesField({
      name: 'slides',
    })
    const slideType = field.fields.find(
      (
        f,
      ): f is Extract<
        typeof f,
        {
          type: 'select'
        }
      > => 'name' in f && f.name === 'slideType',
    )

    expect(slideType).toBeDefined()
    expect(slideType?.type).toBe('select')
    expect(slideType?.defaultValue).toBe('image')
    expect(slideType?.options).toEqual([
      {
        label: 'Image',
        value: 'image',
      },
      {
        label: 'Video',
        value: 'video',
      },
      {
        label: 'Shader',
        value: 'shader',
      },
    ])
  })

  it('includes a single-media upload field allowing images and videos', () => {
    const field = HeroSlidesField({
      name: 'slides',
    })
    const media = field.fields.find(
      (
        f,
      ): f is Extract<
        typeof f,
        {
          type: 'upload'
        }
      > => 'name' in f && f.name === 'media',
    )

    expect(media).toBeDefined()
    expect(media?.type).toBe('upload')
    expect(media?.relationTo).toEqual([
      'images',
      'videos',
    ])
    expect(media?.hasMany).toBeFalsy()
  })

  it("hides the media field when the row's slideType is shader", () => {
    const field = HeroSlidesField({
      name: 'slides',
    })
    const media = field.fields.find(
      (
        f,
      ): f is Extract<
        typeof f,
        {
          type: 'upload'
        }
      > => 'name' in f && f.name === 'media',
    )

    expect(
      media?.admin?.condition?.(
        undefined,
        {
          slideType: 'shader',
        },
        {} as never,
      ),
    ).toBe(false)
    expect(
      media?.admin?.condition?.(
        undefined,
        {
          slideType: 'image',
        },
        {} as never,
      ),
    ).toBe(true)
  })

  it('includes a shader select field registered with the custom admin component', () => {
    const field = HeroSlidesField({
      name: 'slides',
    })
    const shader = field.fields.find(
      (
        f,
      ): f is Extract<
        typeof f,
        {
          type: 'select'
        }
      > => 'name' in f && f.name === 'shader',
    )

    expect(shader).toBeDefined()
    expect(shader?.type).toBe('select')
    expect(shader?.admin?.components?.Field).toMatchObject({
      path: '@/fields/HeroSlides/Components/ShaderSlideField',
    })
  })

  it("only shows the shader field when the row's slideType is shader", () => {
    const field = HeroSlidesField({
      name: 'slides',
    })
    const shader = field.fields.find(
      (
        f,
      ): f is Extract<
        typeof f,
        {
          type: 'select'
        }
      > => 'name' in f && f.name === 'shader',
    )

    expect(
      shader?.admin?.condition?.(
        undefined,
        {
          slideType: 'shader',
        },
        {} as never,
      ),
    ).toBe(true)
    expect(
      shader?.admin?.condition?.(
        undefined,
        {
          slideType: 'video',
        },
        {} as never,
      ),
    ).toBe(false)
  })
})
