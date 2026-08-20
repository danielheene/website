import type { TaskConfig } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { publish } from '@/lib/RedisHandler'
import { cleanPages, type SeedProgress, seedPages } from '@/lib/seed/pages'
import { cleanPosts, seedPosts } from '@/lib/seed/posts'
import { cleanTopics, seedTopics } from '@/lib/seed/topics'
import { seedTaskChannel } from '@/lib/sse/channels'
import { TaskSlug } from '@/types/jobs-queue'

/**
 * Seeds or cleans fixture data for one collection, chosen by
 * `input.collection`. One task, mode-parameterized, matching the
 * established `AutoTranslateBilingualField` convention (`mode: 'manual' |
 * 'auto'`) rather than a task per collection or per direction.
 *
 * Only used by the admin-panel action (`src/components/AdminPanel/SeedActions`)
 * — the CLI scripts call each collection's seedX/cleanX directly and never
 * touch the jobs queue.
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

    const generators: Record<
      string,
      {
        seed: (
          payload: typeof req.payload,
          count: number,
          onProgress?: (progress: SeedProgress) => void,
        ) => Promise<unknown>
        clean: (
          payload: typeof req.payload,
          onProgress?: (progress: SeedProgress) => void,
        ) => Promise<unknown>
      }
    > = {
      pages: {
        seed: seedPages,
        clean: cleanPages,
      },
      posts: {
        seed: seedPosts,
        clean: cleanPosts,
      },
      topics: {
        seed: seedTopics,
        clean: cleanTopics,
      },
    }

    const generator = generators[input.collection]

    if (!generator) {
      const message = `Unknown seedable collection: "${input.collection}"`
      await publish(channel, {
        status: 'error',
        message,
      })
      throw new Error(message)
    }

    try {
      if (input.mode === 'seed') {
        const result = await generator.seed(payload, input.count ?? 1, onProgress)
        await publish(channel, {
          status: 'success',
          ...(result as object),
        })
      } else if (input.mode === 'clean') {
        const result = await generator.clean(payload, onProgress)
        await publish(channel, {
          status: 'success',
          ...(result as object),
        })
      } else {
        throw new Error(`Unknown seed mode: "${input.mode}"`)
      }
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
