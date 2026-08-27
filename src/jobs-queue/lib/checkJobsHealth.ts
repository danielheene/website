import type { Payload } from 'payload'

import { CollectionSlug } from '@/types/collections'

/**
 * How long a due job (`waitUntil` in the past) can sit unprocessed before the
 * queue counts as stalled. Generous relative to the app/worker's autoRun cron
 * (`* * * * *`, i.e. every minute): a couple of missed ticks in a row is a
 * real problem, one slow tick is normal jitter.
 */
const STALLED_AFTER_MS = 5 * 60 * 1000

/** Recent-failure window: failures older than this don't affect current health. */
const RECENT_FAILURE_WINDOW_MS = 60 * 60 * 1000

export interface JobsHealth {
  healthy: boolean
  pendingCount: number
  stalledCount: number
  recentFailureCount: number
  lastCompletedAt: string | null
  checkedAt: string
}

/**
 * Reports job-queue health by querying the `payload-jobs` collection
 * directly, rather than relying on the queue's own scheduled tasks to push a
 * signal out (see `pingUptimeEndpoint`, whose push-based Uptime Kuma monitor
 * has been observed flipping state independently of whether the push itself
 * lands). Shared between the Next.js `/api/health/jobs` route and the
 * standalone worker health server (`scripts/health-server.ts`) so both report
 * identical numbers from the same DB-backed truth.
 */
export const checkJobsHealth = async (payload: Payload): Promise<JobsHealth> => {
  const now = Date.now()
  const stalledBefore = new Date(now - STALLED_AFTER_MS).toISOString()
  const recentFailureSince = new Date(now - RECENT_FAILURE_WINDOW_MS).toISOString()

  const [pending, stalled, recentFailures, lastCompleted] = await Promise.all([
    payload.count({
      collection: CollectionSlug.PayloadJobs,
      where: {
        and: [
          {
            completedAt: {
              exists: false,
            },
          },
          {
            hasError: {
              not_equals: true,
            },
          },
        ],
      },
    }),
    payload.count({
      collection: CollectionSlug.PayloadJobs,
      where: {
        and: [
          {
            completedAt: {
              exists: false,
            },
          },
          {
            hasError: {
              not_equals: true,
            },
          },
          {
            waitUntil: {
              less_than: stalledBefore,
            },
          },
        ],
      },
    }),
    payload.count({
      collection: CollectionSlug.PayloadJobs,
      where: {
        and: [
          {
            hasError: {
              equals: true,
            },
          },
          {
            updatedAt: {
              greater_than: recentFailureSince,
            },
          },
        ],
      },
    }),
    payload.find({
      collection: CollectionSlug.PayloadJobs,
      where: {
        completedAt: {
          exists: true,
        },
      },
      sort: '-completedAt',
      limit: 1,
      select: {
        completedAt: true,
      },
    }),
  ])

  return {
    healthy: stalled.totalDocs === 0,
    pendingCount: pending.totalDocs,
    stalledCount: stalled.totalDocs,
    recentFailureCount: recentFailures.totalDocs,
    lastCompletedAt: lastCompleted.docs[0]?.completedAt ?? null,
    checkedAt: new Date(now).toISOString(),
  }
}
