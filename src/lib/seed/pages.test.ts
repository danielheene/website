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

// createSeedImage() downloads a real placeholder from picsum.photos — this
// stubs that fetch so media-backed pages don't make real network calls,
// which is slow and flaky (timeouts, rate limiting) especially in CI.
const fetchMock = vi.fn(
  async () =>
    new Response(
      new Uint8Array([
        1,
        2,
        3,
      ]),
      {
        status: 200,
      },
    ),
)

beforeEach(() => {
  find.mockReset()
  create.mockReset()
  deleteFn.mockReset()
  fetchMock.mockClear()
  vi.stubGlobal('fetch', fetchMock)
})

describe('seedPages', () => {
  it('creates the requested number of pages, each with a tagged hero background', async () => {
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
    // one page create per iteration, plus one image create per
    // media-backed page (shader-backed pages skip the image entirely)
    const pageCreates = create.mock.calls.filter(([args]) => args.collection === 'pages')
    const imageCreates = create.mock.calls.filter(([args]) => args.collection === 'images')
    expect(pageCreates).toHaveLength(3)
    expect(create).toHaveBeenCalledTimes(3 + imageCreates.length)
  })

  it('gives a shader-backed hero the correct background shape when the shader branch is chosen', async () => {
    find.mockResolvedValue({
      docs: [],
    })
    const heroBackgrounds: unknown[] = []
    create.mockImplementation(async ({ collection, data }) => {
      if (collection === 'images') {
        return {
          id: 'image-1',
        }
      }
      heroBackgrounds.push(data.hero.background)
      return {
        id: 'page-1',
      }
    })

    // A larger batch makes it overwhelmingly likely (with chance(random,
    // 0.25) seeded per-slug) that at least one page lands on the shader
    // branch, without mocking the randomness source directly.
    await seedPages(makePayload(), 20)

    const shaderBackgrounds = heroBackgrounds.filter(
      (
        background,
      ): background is {
        backgroundType: string
        shader: string
      } =>
        (
          background as {
            backgroundType: string
          }
        ).backgroundType === 'shader',
    )
    const mediaBackgrounds = heroBackgrounds.filter(
      (background) =>
        (
          background as {
            backgroundType: string
          }
        ).backgroundType === 'media',
    )

    expect(shaderBackgrounds.length).toBeGreaterThan(0)
    expect(mediaBackgrounds.length).toBeGreaterThan(0)

    for (const background of shaderBackgrounds) {
      expect(background).toEqual({
        backgroundType: 'shader',
        shader: expect.any(String),
      })
    }
    for (const background of mediaBackgrounds) {
      expect(background).toEqual({
        backgroundType: 'media',
        media: [
          {
            relationTo: 'images',
            value: 'image-1',
          },
        ],
      })
    }

    // Image creation is skipped entirely for shader-backed pages.
    const imageCreates = create.mock.calls.filter(([args]) => args.collection === 'images')
    expect(imageCreates).toHaveLength(mediaBackgrounds.length)
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

  it('gives each page 2-4 content blocks, at least one OneColumnContentBlock', async () => {
    find.mockResolvedValue({
      docs: [],
    })
    create.mockImplementation(async ({ collection, data }) => {
      if (collection === 'pages') {
        expect(data.content.length).toBeGreaterThanOrEqual(2)
        expect(data.content.length).toBeLessThanOrEqual(4)
        expect(
          data.content.some(
            (block: { blockType: string }) => block.blockType === 'OneColumnContentBlock',
          ),
        ).toBe(true)
        for (const block of data.content) {
          expect([
            'OneColumnContentBlock',
            'TwoColumnContentBlock',
            'CodeBlock',
            'LinkGroupBlock',
          ]).toContain(block.blockType)
        }
      }
      return {
        id: collection === 'images' ? 'image-1' : 'page-1',
      }
    })

    await seedPages(makePayload(), 1)
  })

  it('gives each created page a non-generic title from the title pool', async () => {
    find.mockResolvedValue({
      docs: [],
    })
    const titles: string[] = []
    create.mockImplementation(async ({ collection, data }) => {
      if (collection === 'pages') {
        titles.push(data.title)
      }
      return {
        id: collection === 'images' ? 'image-1' : 'page-1',
      }
    })

    await seedPages(makePayload(), 3)

    for (const title of titles) {
      expect(title).not.toMatch(/^Seeded Dummy Page/)
    }
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
                background: {
                  media: [
                    {
                      relationTo: 'images',
                      value: 'image-1',
                    },
                  ],
                },
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
    expect(result.deleted).toBe(1)
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
                background: {
                  media: [
                    {
                      relationTo: 'images',
                      value: 'image-1',
                    },
                  ],
                },
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

    expect(result.deleted).toBe(1)
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
                background: {
                  media: [],
                },
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

    expect(result.deleted).toBe(1)
    expect(result.deletedMedia).toBe(0)
    expect(deleteFn).toHaveBeenCalledTimes(1)
  })
})
