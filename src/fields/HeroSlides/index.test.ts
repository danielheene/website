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

  /**
   * Payload's server-side form-state builder reads
   * `fieldConfig.labels.singular` unconditionally when adding a new array
   * row (no optional chaining on its end) — an array field with no `labels`
   * at all crashes the admin UI with "Cannot read properties of undefined
   * (reading 'singular')" the moment a user tries to add the first row.
   */
  it('sets labels so a new row can be added without crashing the admin form-state builder', () => {
    const field = HeroSlidesField({
      name: 'slides',
    })

    expect(field.labels?.singular).toBeTruthy()
    expect(field.labels?.plural).toBeTruthy()
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

  it('defaults to the filmstrip editor', () => {
    const field = HeroSlidesField({
      name: 'slides',
    })

    expect(field.admin?.components?.Field).toMatchObject({
      path: '@/fields/HeroSlides/Components/FilmstripEditor',
    })
  })

  it("uses the sidebar editor component when editorVariant is 'single'", () => {
    const field = HeroSlidesField({
      name: 'slides',
      editorVariant: 'single',
    })

    expect(field.admin?.components?.Field).toMatchObject({
      path: '@/fields/HeroSlides/Components/SingleSlideEditor',
    })
  })

  it("forces maxRows to 1 for editorVariant: 'single', regardless of what's passed", () => {
    const field = HeroSlidesField({
      name: 'slides',
      editorVariant: 'single',
      maxRows: 5,
    })

    expect(field.maxRows).toBe(1)
  })

  it("leaves maxRows unbounded for editorVariant: 'filmstrip' when not explicitly set", () => {
    const field = HeroSlidesField({
      name: 'slides',
      editorVariant: 'filmstrip',
    })

    expect(field.maxRows).toBeUndefined()
  })

  it('does not set admin.position by default', () => {
    const field = HeroSlidesField({
      name: 'slides',
    })

    expect(field.admin?.position).toBeUndefined()
  })

  it("defaults admin.position to 'sidebar' for editorVariant: 'single'", () => {
    const field = HeroSlidesField({
      name: 'slides',
      editorVariant: 'single',
    })

    expect(field.admin?.position).toBe('sidebar')
  })

  it("sets admin.position to 'sidebar' when position is 'sidebar'", () => {
    const field = HeroSlidesField({
      name: 'slides',
      position: 'sidebar',
    })

    expect(field.admin?.position).toBe('sidebar')
  })

  it('position is independent of editorVariant — filmstrip editor can also be placed in the sidebar', () => {
    const field = HeroSlidesField({
      name: 'slides',
      editorVariant: 'filmstrip',
      position: 'sidebar',
    })

    expect(field.admin?.position).toBe('sidebar')
    expect(field.admin?.components?.Field).toMatchObject({
      path: '@/fields/HeroSlides/Components/FilmstripEditor',
    })
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
