import { describe, expect, it } from 'vitest'

import { HeroBackgroundField } from './index'

describe('HeroBackgroundField', () => {
  it('builds a group field with the given name', () => {
    const field = HeroBackgroundField({
      name: 'background',
    })

    expect(field.type).toBe('group')
    expect(field.name).toBe('background')
  })

  it('includes a backgroundType select defaulting to media', () => {
    const field = HeroBackgroundField({
      name: 'background',
    })
    const backgroundType = field.fields.find(
      (
        f,
      ): f is Extract<
        typeof f,
        {
          type: 'select'
        }
      > => 'name' in f && f.name === 'backgroundType',
    )

    expect(backgroundType).toBeDefined()
    expect(backgroundType?.type).toBe('select')
    expect(backgroundType?.defaultValue).toBe('media')
  })

  it('includes a media upload field allowing images and videos', () => {
    const field = HeroBackgroundField({
      name: 'background',
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
    expect(media?.hasMany).toBe(true)
  })

  it('includes a shader select field registered with the custom admin component', () => {
    const field = HeroBackgroundField({
      name: 'background',
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
      path: '@/fields/HeroBackground/Components/FieldComponent',
    })
  })

  it('accepts a hasMany override for the media field (BlogPosts stays single)', () => {
    const field = HeroBackgroundField({
      name: 'background',
      hasManyMedia: false,
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

    expect(media?.hasMany).toBe(false)
  })
})
