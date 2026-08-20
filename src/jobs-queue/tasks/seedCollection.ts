import type { TaskConfig } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { publish } from '@/lib/RedisHandler'
import { cleanPages, type SeedProgress, seedPages } from '@/lib/seed/pages'
import { seedTaskChannel } from '@/lib/sse/channels'
import { TaskSlug } from '@/types/jobs-queue'

/**
 * Seeds or cleans fixture data for one collection, chosen by
 * `input.collection`. One task, mode-parameterized, matching the
 * established `AutoTranslateBilingualField` convention (`mode: 'manual' |
 * 'auto'`) rather than a task per collection or per direction.
 *
 * Only used by the admin-panel action (`src/components/AdminPanel/SeedActions`)
 * — the CLI scripts call `seedPages`/`cleanPages` directly and never touch
 * the jobs queue.
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

    if (input.collection !== 'pages') {
      const message = `Unknown seedable collection: "${input.collection}"`
      await publish(channel, {
        status: 'error',
        message,
      })
      throw new Error(message)
    }

    try {
      if (input.mode === 'seed') {
        const result = await seedPages(payload, input.count ?? 1, onProgress)
        await publish(channel, {
          status: 'success',
          ...result,
        })
      } else if (input.mode === 'clean') {
        const result = await cleanPages(payload, onProgress)
        await publish(channel, {
          status: 'success',
          ...result,
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
