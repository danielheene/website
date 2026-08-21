import type { Payload, TaskConfig } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { publish } from '@/lib/RedisHandler'
import { cleanBlog, seedBlog } from '@/lib/seed/blog'
import { cleanPages, type SeedProgress, seedPages } from '@/lib/seed/pages'
import { seedTaskChannel } from '@/lib/sse/channels'
import { TaskSlug } from '@/types/jobs-queue'

/**
 * One seed/clean routine per seedable collection, each reporting progress
 * the same way (`SeedProgress`) and resolving to a label → count bag for
 * the success toast (see `SeedTaskProgress['counts']`).
 */
const SEED_ROUTINES: Record<
  string,
  {
    seed: (
      payload: Payload,
      count: number,
      onProgress: (progress: SeedProgress) => void,
    ) => Promise<Record<string, number>>
    clean: (
      payload: Payload,
      onProgress: (progress: SeedProgress) => void,
    ) => Promise<Record<string, number>>
  }
> = {
  pages: {
    seed: async (payload, count, onProgress) => {
      const { created } = await seedPages(payload, count, onProgress)
      return {
        'pages created': created,
      }
    },
    clean: async (payload, onProgress) => {
      const { deletedPages, deletedMedia } = await cleanPages(payload, onProgress)
      return {
        'pages deleted': deletedPages,
        'images deleted': deletedMedia,
      }
    },
  },
  posts: {
    seed: async (payload, count, onProgress) => {
      const { created } = await seedBlog(payload, count, onProgress)
      return {
        'posts created': created,
      }
    },
    clean: async (payload, onProgress) => {
      const { deletedPosts, deletedTopics, deletedMedia } = await cleanBlog(payload, onProgress)
      return {
        'posts deleted': deletedPosts,
        'topics deleted': deletedTopics,
        'images deleted': deletedMedia,
      }
    },
  },
}

/**
 * Seeds or cleans fixture data for one collection, chosen by
 * `input.collection`. One task, mode-parameterized, matching the
 * established `AutoTranslateBilingualField` convention (`mode: 'manual' |
 * 'auto'`) rather than a task per collection or per direction.
 *
 * Only used by the admin-panel action (`src/components/AdminPanel/SeedActions`)
 * — the CLI scripts (`scripts/seed-pages.ts`, `scripts/seed-blog.ts`) call
 * the seed/clean functions directly and never touch the jobs queue.
 */
export const seedCollection: TaskConfig<TaskSlug['SeedCollection']> = {
  slug: TaskSlug.SeedCollection,
  label: 'Seed / Clean Collection',
  inputSchema: [
    {
      name: 'collection',
      type: 'text',
      required: true,
    },
    {
      name: 'mode',
      type: 'text',
      required: true,
    },
    {
      name: 'count',
      type: 'number',
    },
  ],
  handler: async ({ input, job, req }) => {
    'use server'

    const { payload } = req

    const channel = seedTaskChannel(String(job.id))
    const onProgress = (progress: SeedProgress) => {
      void publish(channel, {
        status: 'progress',
        ...progress,
      })
    }

    const routine = SEED_ROUTINES[input.collection]
    if (!routine) {
      const message = `Unknown seedable collection: "${input.collection}"`
      await publish(channel, {
        status: 'error',
        message,
      })
      throw new Error(message)
    }

    try {
      let counts: Record<string, number>
      if (input.mode === 'seed') {
        counts = await routine.seed(payload, input.count ?? 1, onProgress)
      } else if (input.mode === 'clean') {
        counts = await routine.clean(payload, onProgress)
      } else {
        throw new Error(`Unknown seed mode: "${input.mode}"`)
      }

      await publish(channel, {
        status: 'success',
        counts,
      })
    } catch (error) {
      await publish(channel, {
        status: 'error',
        message: extractErrorMessage(error),
      })
      throw error
    }

    return {
      output: {},
    }
  },
}
