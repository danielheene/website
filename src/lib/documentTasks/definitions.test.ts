import { describe, expect, it } from 'vitest'

import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

import { documentTaskKey, resolveDocumentRef, resolveDocumentTaskSteps } from './definitions'

describe('resolveDocumentRef', () => {
  it('prefers the slug, then the filename, then the id', () => {
    expect(resolveDocumentRef({ id: 1, slug: 'my-post', filename: 'x.png' })).toBe('my-post')
    expect(resolveDocumentRef({ id: 1, filename: 'hero.webp' })).toBe('hero.webp')
    expect(resolveDocumentRef({ id: 1 })).toBe('1')
  })
})

describe('documentTaskKey', () => {
  it('leaves the collection out for a single-collection task', () => {
    expect(
      documentTaskKey(TaskSlug.ProcessImage, {
        collection: CollectionSlug.MediaImages,
        id: 'a1',
        ref: 'hero.webp',
      }),
    ).toBe('generate-image:hero.webp')
  })

  it('puts the collection in for a task spanning collections', () => {
    expect(
      documentTaskKey(TaskSlug.SyncReferences, {
        collection: CollectionSlug.BlogPosts,
        id: 'a1',
        ref: 'my-post',
      }),
    ).toBe('sync-references:posts:my-post')
  })

  it('falls back to the id without a ref', () => {
    expect(
      documentTaskKey(TaskSlug.CalculateSkillTag, {
        collection: CollectionSlug.ResumeSkillTags,
        id: 'a1',
      }),
    ).toBe('calculate-skill-tag:a1')
  })
})

describe('resolveDocumentTaskSteps', () => {
  it('runs every step when none were requested', () => {
    expect([...resolveDocumentTaskSteps(TaskSlug.ProcessImage, [])]).toEqual([
      'sizes',
      'blur',
      'alt',
    ])
    expect([...resolveDocumentTaskSteps(TaskSlug.ProcessImage, null)]).toEqual([
      'sizes',
      'blur',
      'alt',
    ])
  })

  it('keeps only the requested steps the task knows', () => {
    expect([...resolveDocumentTaskSteps(TaskSlug.GenerateMeta, ['title', 'nope'])]).toEqual([
      'title',
    ])
  })
})
