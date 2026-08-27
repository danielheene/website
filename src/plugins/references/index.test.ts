import type { CollectionConfig, Config } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { CollectionSlug } from '@/types/collections'

import { referencesPlugin } from './index'

const collection = (slug: string): CollectionConfig => ({
  slug,
  fields: [],
})

const buildConfig = (collections: string[]): Config =>
  ({
    collections: collections.map(collection),
    globals: [],
  }) as unknown as Config

/**
 * Applies the plugin to a throwaway config.
 *
 * `Plugin` is declared as returning `Config | Promise<Config>`; this one is
 * synchronous, so the result is narrowed here rather than at every call site.
 */
const applyPlugin = (
  collections: string[],
  options?: Parameters<typeof referencesPlugin>[0],
): Config => referencesPlugin(options)(buildConfig(collections)) as Config

const collectionsOf = (config: Config) => config.collections ?? []

const findCollection = (config: Config, slug: string) =>
  collectionsOf(config).find((entry) => entry.slug === slug)

const hasDeleteGuard = (config: Config, slug: string) =>
  (findCollection(config, slug)?.hooks?.beforeDelete?.length ?? 0) > 0

/**
 * Runs a guarded collection's beforeDelete with a stubbed usage lookup.
 *
 * `titles` maps "<collection>:<id>" to the value its `useAsTitle` field would
 * return; sources absent from it resolve to nothing, exercising the id
 * fallback.
 */
const runGuard = async (
  config: Config,
  slug: string,
  usages: {
    sourceCollection: string
    sourceId: string
    sourceType?: 'collection' | 'global'
    path?: string
  }[],
  titles: Record<string, string> = {},
) => {
  const find = vi.fn().mockResolvedValue({
    docs: usages.map((usage) => ({
      sourceType: 'collection',
      ...usage,
    })),
  })

  const collections = Object.fromEntries(
    usages.map(({ sourceCollection }) => [
      sourceCollection,
      {
        config: {
          labels: {
            singular: sourceCollection === CollectionSlug.BlogPosts ? 'Post' : 'Page',
          },
          admin: {
            useAsTitle: 'title',
          },
        },
      },
    ]),
  )

  const findByID = vi.fn(async ({ collection, id }: { collection: string; id: string }) => {
    const title = titles[`${collection}:${id}`]
    if (!title) throw new Error('not found')
    return {
      title,
    }
  })

  const guard = findCollection(config, slug)?.hooks?.beforeDelete?.at(-1)

  return await (guard as unknown as (args: unknown) => Promise<void>)({
    id: 'target-1',
    req: {
      payload: {
        find,
        findByID,
        collections,
      },
    },
    context: {},
  })
}

describe('referencesPlugin', () => {
  it('tracks non-media collections, not only media', () => {
    const config = applyPlugin([
      CollectionSlug.BlogPosts,
      CollectionSlug.BlogTopics,
      CollectionSlug.MediaImages,
    ])

    for (const slug of [
      CollectionSlug.BlogPosts,
      CollectionSlug.BlogTopics,
      CollectionSlug.MediaImages,
    ]) {
      expect(findCollection(config, slug)?.hooks?.afterChange?.length ?? 0).toBeGreaterThan(0)
    }
  })

  it('guards every tracked collection by default, not only media', () => {
    const config = applyPlugin([
      CollectionSlug.BlogTopics,
      CollectionSlug.MediaImages,
    ])

    expect(hasDeleteGuard(config, CollectionSlug.MediaImages)).toBe(true)
    // the behaviour this change adds: a topic in use is protected too
    expect(hasDeleteGuard(config, CollectionSlug.BlogTopics)).toBe(true)
  })

  it('never guards or tracks the bookkeeping table itself', () => {
    const config = applyPlugin([
      CollectionSlug.DocumentReferences,
    ])

    expect(hasDeleteGuard(config, CollectionSlug.DocumentReferences)).toBe(false)
    expect(
      findCollection(config, CollectionSlug.DocumentReferences)?.hooks?.afterChange?.length ?? 0,
    ).toBe(0)
  })

  it('narrows the guard when guardedCollections is given', () => {
    const config = applyPlugin(
      [
        CollectionSlug.BlogTopics,
        CollectionSlug.MediaImages,
      ],
      {
        guardedCollections: [
          CollectionSlug.MediaImages,
        ],
      },
    )

    expect(hasDeleteGuard(config, CollectionSlug.MediaImages)).toBe(true)
    expect(hasDeleteGuard(config, CollectionSlug.BlogTopics)).toBe(false)
  })

  it('blocks deleting a document that another document still references', async () => {
    const config = applyPlugin([
      CollectionSlug.BlogTopics,
    ])

    await expect(
      runGuard(config, CollectionSlug.BlogTopics, [
        {
          sourceCollection: CollectionSlug.BlogPosts,
          sourceId: 'post-1',
        },
      ]),
    ).rejects.toThrow(/Cannot delete: still used by 1 document/)
  })

  it('names the blocking documents by label and title rather than id', async () => {
    const config = applyPlugin([
      CollectionSlug.MediaImages,
    ])

    await expect(
      runGuard(
        config,
        CollectionSlug.MediaImages,
        [
          {
            sourceCollection: CollectionSlug.BlogPosts,
            sourceId: '6712abcdef0123456789abcd',
            path: 'heroImage',
          },
        ],
        {
          [`${CollectionSlug.BlogPosts}:6712abcdef0123456789abcd`]: 'Hello World',
        },
      ),
    ).rejects.toThrow('Post "Hello World" (heroImage)')
  })

  it('falls back to the id when the title cannot be resolved', async () => {
    const config = applyPlugin([
      CollectionSlug.MediaImages,
    ])

    await expect(
      runGuard(config, CollectionSlug.MediaImages, [
        {
          sourceCollection: CollectionSlug.BlogPosts,
          sourceId: 'post-1',
        },
      ]),
    ).rejects.toThrow('Post "post-1"')
  })

  it('summarises the remainder past the listed limit', async () => {
    const config = applyPlugin([
      CollectionSlug.MediaImages,
    ])

    const usages = Array.from(
      {
        length: 7,
      },
      (_, index) => ({
        sourceCollection: CollectionSlug.BlogPosts,
        sourceId: `post-${index}`,
      }),
    )

    await expect(runGuard(config, CollectionSlug.MediaImages, usages)).rejects.toThrow(
      /still used by 7 documents .*and 2 more/,
    )
  })

  it('does not let a redirect pointing at a document block its deletion', async () => {
    const config = applyPlugin([
      CollectionSlug.BlogPosts,
    ])

    await expect(
      runGuard(config, CollectionSlug.BlogPosts, [
        {
          sourceCollection: CollectionSlug.Redirects,
          sourceId: 'redirect-1',
        },
      ]),
    ).resolves.toBeUndefined()
  })

  it('records references from an upload field nested in a block', async () => {
    const config = applyPlugin([
      CollectionSlug.Pages,
    ])

    const created: Record<string, unknown>[] = []
    const payload = {
      delete: vi.fn().mockResolvedValue({}),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        created.push(data)
        return data
      }),
      logger: {
        info: vi.fn(),
        error: vi.fn(),
      },
    }

    const track = findCollection(config, CollectionSlug.Pages)?.hooks?.afterChange?.at(0)

    await (track as unknown as (args: unknown) => Promise<unknown>)({
      doc: {
        id: 'page-1',
        _status: 'published',
        content: [
          {
            blockType: 'ResumeAboutMeBlock',
            id: 'block-1',
            portrait: {
              relationTo: CollectionSlug.MediaImages,
              value: 'img-1',
            },
          },
        ],
      },
      req: {
        payload,
      },
      context: {},
    })

    expect(created).toEqual([
      expect.objectContaining({
        targetCollection: CollectionSlug.MediaImages,
        targetId: 'img-1',
        sourceCollection: CollectionSlug.Pages,
        sourceId: 'page-1',
        path: 'content.0.portrait',
      }),
    ])
  })

  it('tracks references even when another afterChange hook throws', async () => {
    // revalidatePath throws outside a Next.js request scope; tracking must not
    // depend on unrelated hooks succeeding
    const failing: CollectionConfig = {
      slug: CollectionSlug.Pages,
      fields: [],
      hooks: {
        afterChange: [
          async () => {
            throw new Error('Invariant: static generation store missing')
          },
        ],
      },
    }

    const config = referencesPlugin()({
      collections: [
        failing,
      ],
      globals: [],
    } as unknown as Config) as Config

    const created: Record<string, unknown>[] = []
    const payload = {
      delete: vi.fn().mockResolvedValue({}),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        created.push(data)
        return data
      }),
      logger: {
        info: vi.fn(),
        error: vi.fn(),
      },
    }

    const hooks = findCollection(config, CollectionSlug.Pages)?.hooks?.afterChange ?? []
    const args = {
      doc: {
        id: 'page-1',
        hero: {
          relationTo: CollectionSlug.MediaImages,
          value: 'img-1',
        },
      },
      req: {
        payload,
      },
      context: {},
    }

    // Payload awaits the chain in order and stops at the first rejection
    await expect(
      (async () => {
        for (const hook of hooks) {
          await (hook as unknown as (a: unknown) => Promise<unknown>)(args)
        }
      })(),
    ).rejects.toThrow(/static generation store/)

    expect(created).toHaveLength(1)
  })

  it('still blocks when a real usage accompanies a redirect', async () => {
    const config = applyPlugin([
      CollectionSlug.BlogPosts,
    ])

    await expect(
      runGuard(config, CollectionSlug.BlogPosts, [
        {
          sourceCollection: CollectionSlug.Redirects,
          sourceId: 'redirect-1',
        },
        {
          sourceCollection: CollectionSlug.Pages,
          sourceId: 'page-1',
        },
      ]),
    ).rejects.toThrow(/Cannot delete: still used by 1 document/)
  })
})
