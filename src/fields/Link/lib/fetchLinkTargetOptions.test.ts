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
  }))

  return {
    find,
    req: {
      payload: {
        find,
      },
      user: {
        id: 'user-1',
      },
    } as never,
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
})
