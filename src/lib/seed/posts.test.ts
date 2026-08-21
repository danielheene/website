import type { Payload } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { cleanPosts, seedPosts } from './posts'

const find = vi.fn()
const create = vi.fn()
const deleteFn = vi.fn()

const makePayload = (): Payload =>
  ({
    find,
    create,
    delete: deleteFn,
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  }) as unknown as Payload

beforeEach(() => {
  find.mockReset()
  create.mockReset()
  deleteFn.mockReset()
})

describe('seedPosts', () => {
  it('creates the requested number of posts, each tagged and with a hero image', async () => {
    find.mockResolvedValue({
      docs: [],
    })
    create.mockImplementation(async ({ collection, data }) => {
      if (collection === 'images') {
        return {
          id: 'image-1',
        }
      }
      if (collection === 'topics') {
        return {
          id: 'topic-1',
        }
      }
      expect(data.generatorFlags).toEqual([
        'seeded-dummy',
      ])
      expect(data.heroImage).toEqual({
        relationTo: 'images',
        value: 'image-1',
      })
      return {
        id: 'post-1',
      }
    })

    const result = await seedPosts(makePayload(), 2)

    expect(result.created).toBe(2)
  })

  it('skips a slug that already exists instead of creating a duplicate', async () => {
    find.mockImplementation(async ({ collection, where }) => {
      if (collection === 'posts' && where?.slug?.equals) {
        return {
          docs: [
            {
              id: 'existing',
            },
          ],
        }
      }
      return {
        docs: [],
      }
    })
    create.mockResolvedValue({
      id: 'created',
    })

    const result = await seedPosts(makePayload(), 1)

    expect(result.created).toBe(0)
    expect(create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'posts',
      }),
    )
  })

  it('reuses existing seeded topics before creating new ones', async () => {
    find.mockImplementation(async ({ collection, where }) => {
      if (collection === 'topics' && where?.generatorFlags) {
        return {
          docs: [
            {
              id: 'existing-topic-1',
            },
            {
              id: 'existing-topic-2',
            },
          ],
        }
      }
      return {
        docs: [],
      }
    })
    create.mockImplementation(async ({ collection }) => ({
      id: collection === 'images' ? 'image-1' : 'post-1',
    }))

    await seedPosts(makePayload(), 1)

    // enough seeded topics already existed — no new topic should be created
    expect(create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'topics',
      }),
    )
  })

  it('tops up to the full requested topic count even when seedTopics skips already-existing pool slots (partial shortfall)', async () => {
    // Simulates the real seedTopics skip-by-slug behavior: one seeded topic
    // ("TypeScript", the pool's first slot) already exists. A post that
    // needs 2 topics should still end up with 2 topic ids related, even
    // though a naive `seedTopics(payload, count - existing.length)` call
    // would only ask for 1 more and that 1 slot (pool index 1, "TypeScript")
    // is the one that's already taken — producing 0 new topics and only 1
    // total, not the requested 2.
    const existingTopics = [
      {
        id: 'existing-topic-typescript',
        slug: 'seeded-dummy-topic-typescript',
      },
    ]
    let nextTopicId = 1

    find.mockImplementation(async ({ collection, where }) => {
      if (collection === 'topics') {
        if (where?.slug?.equals) {
          return {
            docs: existingTopics.filter((topic) => topic.slug === where.slug.equals),
          }
        }
        if (where?.generatorFlags) {
          return {
            docs: existingTopics,
          }
        }
      }
      return {
        docs: [],
      }
    })

    const postTopicCounts: number[] = []

    create.mockImplementation(async ({ collection, data }) => {
      if (collection === 'images') {
        return {
          id: 'image-1',
        }
      }
      if (collection === 'topics') {
        const id = `created-topic-${nextTopicId}`
        nextTopicId += 1
        existingTopics.push({
          id,
          slug: data.slug,
        })
        return {
          id,
        }
      }
      postTopicCounts.push(data.topics.length)
      return {
        id: 'post-1',
      }
    })

    // 3 posts: indexes 1 and 2 need 1 topic each, index 3 needs 2
    // (topicCount = 1 + (index % 3 === 0 ? 1 : 0)) — the third post is the
    // one that must top up beyond the single pre-existing topic.
    await seedPosts(makePayload(), 3)

    expect(postTopicCounts).toEqual([
      1,
      1,
      2,
    ])
  })

  it('rotates through the resolved topic pool so posts do not all get the same topic', async () => {
    const poolIds = [
      'topic-a',
      'topic-b',
      'topic-c',
    ]

    find.mockImplementation(async ({ collection, where }) => {
      if (collection === 'topics' && where?.generatorFlags) {
        return {
          docs: poolIds.map((id) => ({
            id,
          })),
        }
      }
      return {
        docs: [],
      }
    })

    const perPostTopicIds: string[][] = []

    create.mockImplementation(async ({ collection, data }) => {
      if (collection === 'images') {
        return {
          id: 'image-1',
        }
      }
      perPostTopicIds.push(data.topics.map((entry: { value: string }) => entry.value))
      return {
        id: 'post-1',
      }
    })

    await seedPosts(makePayload(), 4)

    // Every post should have gotten at least one topic, and the leading
    // topic must vary across posts rather than always being the pool's first.
    const leadTopics = perPostTopicIds.map((ids) => ids[0])
    expect(new Set(leadTopics).size).toBeGreaterThan(1)
    for (const ids of perPostTopicIds) {
      for (const id of ids) {
        expect(poolIds).toContain(id)
      }
    }
  })

  it('resolves the topic pool once per run, not once per post', async () => {
    find.mockImplementation(async ({ collection, where }) => {
      if (collection === 'topics' && where?.generatorFlags) {
        return {
          docs: [
            {
              id: 'existing-topic-1',
            },
            {
              id: 'existing-topic-2',
            },
          ],
        }
      }
      return {
        docs: [],
      }
    })
    create.mockImplementation(async ({ collection }) => ({
      id: collection === 'images' ? 'image-1' : 'post-1',
    }))

    await seedPosts(makePayload(), 5)

    const topicPoolLookups = find.mock.calls.filter(
      ([args]) => args.collection === 'topics' && args.where?.generatorFlags,
    )
    expect(topicPoolLookups).toHaveLength(1)
  })

  it('relates each post to 1-2 topic ids', async () => {
    find.mockImplementation(async ({ collection, where }) => {
      if (collection === 'topics' && where?.generatorFlags) {
        return {
          docs: [
            {
              id: 'existing-topic-1',
            },
            {
              id: 'existing-topic-2',
            },
          ],
        }
      }
      return {
        docs: [],
      }
    })
    create.mockImplementation(async ({ collection, data }) => {
      if (collection === 'images') {
        return {
          id: 'image-1',
        }
      }
      expect(data.topics.length).toBeGreaterThanOrEqual(1)
      expect(data.topics.length).toBeLessThanOrEqual(2)
      for (const entry of data.topics) {
        expect(entry.relationTo).toBe('topics')
      }
      return {
        id: 'post-1',
      }
    })

    await seedPosts(makePayload(), 1)
  })
})

describe('cleanPosts', () => {
  it('deletes every seeded-dummy post and only the seeded-dummy media it referenced', async () => {
    find.mockImplementation(async ({ collection }) => {
      if (collection === 'posts') {
        return {
          docs: [
            {
              id: 'post-1',
              heroImage: {
                relationTo: 'images',
                value: 'image-1',
              },
            },
          ],
        }
      }
      if (collection === 'images') {
        return {
          docs: [
            {
              id: 'image-1',
              generatorFlags: [
                'seeded-dummy',
              ],
            },
          ],
        }
      }
      return {
        docs: [],
      }
    })

    const result = await cleanPosts(makePayload())

    expect(result.deleted).toBe(1)
    expect(result.deletedMedia).toBe(1)
    expect(deleteFn).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'posts',
        id: 'post-1',
      }),
    )
    expect(deleteFn).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'images',
        id: 'image-1',
      }),
    )
  })

  it('does not delete media that a seeded post referenced but which no longer carries the seeded-dummy flag', async () => {
    find.mockImplementation(async ({ collection }) => {
      if (collection === 'posts') {
        return {
          docs: [
            {
              id: 'post-1',
              heroImage: {
                relationTo: 'images',
                value: 'image-1',
              },
            },
          ],
        }
      }
      if (collection === 'images') {
        return {
          docs: [],
        }
      }
      return {
        docs: [],
      }
    })

    const result = await cleanPosts(makePayload())

    expect(result.deleted).toBe(1)
    expect(result.deletedMedia).toBe(0)
  })

  it('does not touch BlogTopics', async () => {
    find.mockImplementation(async ({ collection }) => {
      if (collection === 'posts') {
        return {
          docs: [
            {
              id: 'post-1',
              heroImage: null,
            },
          ],
        }
      }
      return {
        docs: [],
      }
    })

    await cleanPosts(makePayload())

    expect(find).not.toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'topics',
      }),
    )
    expect(deleteFn).not.toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'topics',
      }),
    )
  })
})
