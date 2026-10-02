import { getPayload } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { CollectionSlug } from '@/types/collections'

vi.mock('@payload-config', () => ({
  default: {},
}))

const { resolveRelations } = await import('./resolveRelation')

describe('resolveRelations', () => {
  it('fetches referenced documents without populating their join fields', async () => {
    const findByIDMock = vi.fn(async () => ({
      id: 'tag-1',
      title: 'TypeScript',
    }))
    vi.mocked(getPayload).mockResolvedValueOnce({
      findByID: findByIDMock,
    } as unknown as Awaited<ReturnType<typeof getPayload>>)

    const resolved = await resolveRelations({
      tag: {
        relationTo: CollectionSlug.ResumeSkillTags,
        value: 'tag-1',
      },
    })

    expect(findByIDMock).toHaveBeenCalledWith({
      collection: CollectionSlug.ResumeSkillTags,
      id: 'tag-1',
      joins: false,
    })
    expect(resolved.tag.value).toEqual({
      id: 'tag-1',
      title: 'TypeScript',
    })
  })
})
