import type { Payload } from 'payload'

import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

/**
 * How long a due job (`waitUntil` in the past) can sit unprocessed before the
 * queue counts as stalled. Generous relative to the app/worker's autoRun cron
 * (`* * * * *`, i.e. every minute): a couple of missed ticks in a row is a
 * real problem, one slow tick is normal jitter.
 */
const STALLED_AFTER_MS = 5 * 60 * 1000

/** Recent-failure window: failures older than this don't affect current health. */
const RECENT_FAILURE_WINDOW_MS = 60 * 60 * 1000

/**
 * How long since the last completed `HeartbeatPing` before the worker
 * processing that queue counts as unresponsive. Generous relative to its
 * own every-minute schedule for the same reason as `STALLED_AFTER_MS`.
 */
const HEARTBEAT_STALE_AFTER_MS = 3 * 60 * 1000

export interface JobsHealth {
  healthy: boolean
  pendingCount: number
  stalledCount: number
  recentFailureCount: number
  lastCompletedAt: string | null
  lastHeartbeatAt: string | null
  heartbeatStale: boolean
  checkedAt: string
}

/**
 * Reports job-queue health by querying the `payload-jobs` collection
 * directly, rather than relying on the queue's own scheduled tasks to signal
 * health themselves — except for `heartbeatPing`, whose own completion
 * record is used here as a second, independent signal: a worker can have no
 * stalled jobs simply because nothing has been enqueued, so the absence of a
 * recent heartbeat is the only way to tell "queue is idle" apart from "queue
 * runner stopped." Shared between the Next.js `/api/health/jobs` route and
 * the standalone worker health server (`scripts/health-server.ts`) so both
 * report identical numbers from the same DB-backed truth.
 */
export const checkJobsHealth = async (payload: Payload): Promise<JobsHealth> => {
  const now = Date.now()
  const stalledBefore = new Date(now - STALLED_AFTER_MS).toISOString()
  const recentFailureSince = new Date(now - RECENT_FAILURE_WINDOW_MS).toISOString()
  const heartbeatStaleBefore = new Date(now - HEARTBEAT_STALE_AFTER_MS).toISOString()

  const [pending, stalled, recentFailures, lastCompleted, lastHeartbeat] = await Promise.all([
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
    payload.find({
      collection: CollectionSlug.PayloadJobs,
      where: {
        and: [
          {
            taskSlug: {
              equals: TaskSlug.HeartbeatPing,
            },
          },
          {
            completedAt: {
              exists: true,
            },
          },
        ],
      },
      sort: '-completedAt',
      limit: 1,
      select: {
        completedAt: true,
      },
    }),
  ])

  const lastHeartbeatAt = lastHeartbeat.docs[0]?.completedAt ?? null
  const heartbeatStale = lastHeartbeatAt === null || lastHeartbeatAt < heartbeatStaleBefore

  return {
    healthy: stalled.totalDocs === 0 && !heartbeatStale,
    pendingCount: pending.totalDocs,
    stalledCount: stalled.totalDocs,
    recentFailureCount: recentFailures.totalDocs,
    lastCompletedAt: lastCompleted.docs[0]?.completedAt ?? null,
    lastHeartbeatAt,
    heartbeatStale,
    checkedAt: new Date(now).toISOString(),
  }
}
