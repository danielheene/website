import type { PayloadRequest } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import {
  fetchLinkTargetOptions,
  LINK_TARGET_OPTION_LIMIT,
  linkTargetOptionValue,
} from './fetchLinkTargetOptions'

const makeReq = (
  docsByCollection: Record<
    string,
    {
      id: string
      title: string
    }[]
  >,
) => {
  const find = vi.fn(async ({ collection }: { collection: string }) => ({
    docs: docsByCollection[collection] ?? [],
    totalDocs: (docsByCollection[collection] ?? []).length,
  }))

  const user = {
    id: 'user-1',
  } as PayloadRequest['user']

  const req = {
    payload: {
      find,
      logger: {
        warn: vi.fn(),
      },
    },
    user,
  } as unknown as PayloadRequest

  return {
    find,
    user,
    req,
  }
}

describe('linkTargetOptionValue', () => {
  it('namespaces the id by collection', () => {
    expect(linkTargetOptionValue('pages', 'abc')).toBe('pages:abc')
  })
})

describe('fetchLinkTargetOptions', () => {
  it('returns one group per collection, in configured order', async () => {
    const { req } = makeReq({
      pages: [
        {
          id: 'p1',
          title: 'About us',
        },
      ],
      posts: [
        {
          id: 'b1',
          title: 'Hello world',
        },
      ],
      topics: [],
    })

    const groups = await fetchLinkTargetOptions(req)

    expect(groups.map((group) => group.label)).toEqual([
      'Pages',
      'Blog Posts',
      'Topics',
    ])
    expect(groups[0].options).toEqual([
      {
        label: 'About us',
        value: 'pages:p1',
        relationTo: 'pages',
        docID: 'p1',
      },
    ])
    expect(groups[2].options).toEqual([])
  })

  it('queries each collection with access control enforced', async () => {
    const { find, req } = makeReq({})

    await fetchLinkTargetOptions(req)

    expect(find).toHaveBeenCalledTimes(3)
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'pages',
        depth: 0,
        limit: LINK_TARGET_OPTION_LIMIT,
        overrideAccess: false,
        sort: 'title',
        req,
        user: req.user,
      }),
    )
  })

  it('falls back to the id when a document has no title', async () => {
    const { req } = makeReq({
      pages: [
        {
          id: 'p1',
        } as never,
      ],
    })

    const groups = await fetchLinkTargetOptions(req)

    expect(groups[0].options[0].label).toBe('p1')
  })

  it('warns when a collection has more documents than the option limit', async () => {
    const { req } = makeReq({})
    const totalDocs = LINK_TARGET_OPTION_LIMIT + 5
    req.payload.find = vi.fn(async ({ collection }: { collection: string }) => ({
      docs: [],
      totalDocs: collection === 'pages' ? totalDocs : 0,
    })) as unknown as typeof req.payload.find

    await fetchLinkTargetOptions(req)

    expect(req.payload.logger.warn).toHaveBeenCalledTimes(1)
    const [message] = (req.payload.logger.warn as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
    ]
    expect(message).toContain('pages')
    expect(message).toContain(String(LINK_TARGET_OPTION_LIMIT))
    expect(message).toContain(String(totalDocs))
  })

  it('does not warn when totalDocs is within the option limit', async () => {
    const { req } = makeReq({
      pages: [
        {
          id: 'p1',
          title: 'About us',
        },
      ],
    })

    await fetchLinkTargetOptions(req)

    expect(req.payload.logger.warn).not.toHaveBeenCalled()
  })
})
