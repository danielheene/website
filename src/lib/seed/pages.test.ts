import type { Payload } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { cleanPages, seedPages } from './pages'

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
      error: vi.fn(),
    },
  }) as unknown as Payload

beforeEach(() => {
  find.mockReset()
  create.mockReset()
  deleteFn.mockReset()
})

describe('seedPages', () => {
  it('creates the requested number of pages, each with a tagged hero image', async () => {
    find.mockResolvedValue({
      docs: [],
    })
    create.mockImplementation(async ({ collection }) => {
      if (collection === 'images') {
        return {
          id: 'image-1',
        }
      }
      return {
        id: 'page-1',
      }
    })

    const result = await seedPages(makePayload(), 3)

    expect(result.created).toBe(3)
    // one image create + one page create per iteration
    expect(create).toHaveBeenCalledTimes(6)
  })

  it('skips a slug that already exists instead of creating a duplicate', async () => {
    find.mockImplementation(async ({ collection, where }) => {
      if (collection === 'pages' && where?.slug?.equals === 'seeded-dummy-page-1') {
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

    const onProgress = vi.fn()
    const result = await seedPages(makePayload(), 1, onProgress)

    expect(result.created).toBe(0)
    expect(create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'pages',
      }),
    )
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'pages',
        where: {
          slug: {
            equals: 'seeded-dummy-page-1',
          },
        },
        trash: true,
      }),
    )
    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        current: 1,
        total: 1,
      }),
    )
  })

  it('tags every created page and image with the seeded-dummy flag', async () => {
    find.mockResolvedValue({
      docs: [],
    })
    create.mockImplementation(async ({ collection, data }) => {
      expect(data.generatorFlags).toEqual([
        'seeded-dummy',
      ])
      return {
        id: collection === 'images' ? 'image-1' : 'page-1',
      }
    })

    await seedPages(makePayload(), 1)

    expect(create).toHaveBeenCalledTimes(2)
  })
})

describe('cleanPages', () => {
  it('deletes every seeded-dummy page and only the seeded-dummy media it referenced', async () => {
    find.mockImplementation(async ({ collection }) => {
      if (collection === 'pages') {
        return {
          docs: [
            {
              id: 'page-1',
              hero: {
                media: [
                  {
                    relationTo: 'images',
                    value: 'image-1',
                  },
                ],
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

    const result = await cleanPages(makePayload())

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'pages',
        where: {
          generatorFlags: {
            in: [
              'seeded-dummy',
            ],
          },
        },
        trash: true,
      }),
    )
    expect(result.deletedPages).toBe(1)
    expect(result.deletedMedia).toBe(1)
    expect(deleteFn).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'pages',
        id: 'page-1',
        trash: true,
      }),
    )
    expect(deleteFn).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'images',
        id: 'image-1',
      }),
    )
    expect(deleteFn).not.toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'images',
        trash: true,
      }),
    )
  })

  it('does not delete media that a seeded page referenced but which no longer carries the seeded-dummy flag', async () => {
    find.mockImplementation(async ({ collection }) => {
      if (collection === 'pages') {
        return {
          docs: [
            {
              id: 'page-1',
              hero: {
                media: [
                  {
                    relationTo: 'images',
                    value: 'image-1',
                  },
                ],
              },
            },
          ],
        }
      }
      if (collection === 'images') {
        // Simulates a real, hand-uploaded image the seeded page's hero was
        // manually edited to point at: no seeded-dummy flag, so the live
        // find (filtered by id AND the flag) returns no match.
        return {
          docs: [],
        }
      }
      return {
        docs: [],
      }
    })

    const result = await cleanPages(makePayload())

    expect(result.deletedPages).toBe(1)
    expect(result.deletedMedia).toBe(0)
    expect(deleteFn).not.toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'images',
        id: 'image-1',
      }),
    )
  })

  it('does not delete media that carries no reference from a seeded page', async () => {
    find.mockImplementation(async ({ collection }) => {
      if (collection === 'pages') {
        return {
          docs: [
            {
              id: 'page-1',
              hero: {
                media: [],
              },
            },
          ],
        }
      }
      return {
        docs: [],
      }
    })

    const result = await cleanPages(makePayload())

    expect(result.deletedPages).toBe(1)
    expect(result.deletedMedia).toBe(0)
    expect(deleteFn).toHaveBeenCalledTimes(1)
  })
})
