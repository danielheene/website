import type { Payload, TaskHandler } from 'payload'

import { wrapHandler } from '@/jobs-queue/lib/withJobObservability'
import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { publish } from '@/lib/RedisHandler'
import { cleanPages, type SeedProgress, seedPages } from '@/lib/seed/pages'
import { cleanPosts, seedPosts } from '@/lib/seed/posts'
import { cleanTopics, seedTopics } from '@/lib/seed/topics'
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
      const { deleted, deletedMedia } = await cleanPages(payload, onProgress)
      return {
        'pages deleted': deleted,
        'images deleted': deletedMedia,
      }
    },
  },
  posts: {
    seed: async (payload, count, onProgress) => {
      const { created } = await seedPosts(payload, count, onProgress)
      return {
        'posts created': created,
      }
    },
    clean: async (payload, onProgress) => {
      const { deleted, deletedMedia } = await cleanPosts(payload, onProgress)
      return {
        'posts deleted': deleted,
        'images deleted': deletedMedia,
      }
    },
  },
  topics: {
    seed: async (payload, count, onProgress) => {
      const { created } = await seedTopics(payload, count, onProgress)
      return {
        'topics created': created,
      }
    },
    clean: async (payload, onProgress) => {
      const { deleted, skipped } = await cleanTopics(payload, onProgress)
      return {
        'topics deleted': deleted,
        // present even at 0 so a fully-clean run doesn't silently omit it —
        // omitting entirely would read as "nothing was checked" rather than
        // "nothing needed skipping"
        'topics skipped (still referenced)': skipped,
      }
    },
  },
}

const run: TaskHandler<TaskSlug['SeedCollection']> = async ({ input, job, req }) => {
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
}

export const handler = wrapHandler(TaskSlug.SeedCollection, run)
