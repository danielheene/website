import type { BaseFilter, Where } from 'payload'

import { STALLED_AFTER_MS } from '@/jobs-queue/lib/checkJobsHealth'
import { QueueSlug } from '@/types/jobs-queue'

/**
 * Query parameters that scope the `payload-jobs` admin list. Independent of
 * each other — a queue and a state can be selected at once — so each gets its
 * own parameter rather than sharing one.
 */
export const JOBS_QUEUE_PARAM = 'queue'
export const JOBS_STATE_PARAM = 'state'

const isQueueSlugValue = (value: unknown): value is QueueSlug[keyof QueueSlug] =>
  typeof value === 'string' && Object.values(QueueSlug).includes(value as never)

/**
 * Reads the requested queue, falling back to `null` (every queue).
 */
export const resolveJobQueue = (value: unknown): QueueSlug[keyof QueueSlug] | null =>
  isQueueSlugValue(value) ? value : null

/**
 * A job's lifecycle collapsed to the states an admin actually distinguishes
 * between at a glance. `Pending` covers both "not started yet" and
 * "currently processing" — Payload doesn't need a separate bucket for those
 * two on this list, unlike the dashboard widget which only ever shows
 * unfinished jobs in the first place. `Stale` is the subset of `Pending`
 * whose `waitUntil` is far enough in the past that `checkJobsHealth` would
 * count it as stalled — surfaced as its own state since "overdue" is what an
 * admin is actually looking for when the queue seems stuck.
 */
export const JobState = {
  Pending: 'pending',
  Stale: 'stale',
  Completed: 'completed',
  Failed: 'failed',
} as const

export type JobState = (typeof JobState)[keyof typeof JobState]

const isJobState = (value: unknown): value is JobState =>
  typeof value === 'string' && Object.values(JobState).includes(value as JobState)

/**
 * Reads the requested state, falling back to `null` (every state).
 */
export const resolveJobState = (value: unknown): JobState | null =>
  isJobState(value) ? value : null

const notFinished: Where[] = [
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
]

/**
 * @param now Epoch ms the `Stale` cutoff is measured against — passed in
 * (rather than read with `Date.now()` here) so `scopeJobsList` computes it
 * once per request instead of the state and queue clauses racing to read
 * slightly different instants.
 */
const stateWhere = (state: JobState, now: number): Where => {
  switch (state) {
    case JobState.Completed:
      return {
        completedAt: {
          exists: true,
        },
      }
    case JobState.Failed:
      return {
        hasError: {
          equals: true,
        },
      }
    case JobState.Pending:
      return {
        and: notFinished,
      }
    case JobState.Stale:
      return {
        and: [
          ...notFinished,
          {
            waitUntil: {
              less_than: new Date(now - STALLED_AFTER_MS).toISOString(),
            },
          },
        ],
      }
  }
}

/**
 * Scopes the `payload-jobs` admin list to a queue, a state, or both at once.
 *
 * Mirrors the media collections' `scopeMediaAssets`: a `baseFilter` reading
 * query parameters that a `Description` component (`JobsQueueTabs`) sets, so
 * the two toggles combine into a single `Where` without either needing to
 * know about the other.
 *
 * `QueueSlug.Heartbeat` is excluded whenever no queue is explicitly
 * selected — its jobs are an internal liveness signal, not work an admin
 * reviews by default — but selecting it explicitly (via `JobsQueueTabs`)
 * still surfaces them, the same way `scopeMediaAssets` defaults to
 * `Uploaded` while still allowing `Generated`/`All` to be chosen.
 */
export const scopeJobsList: BaseFilter = ({ req }) => {
  const queue = resolveJobQueue(req.query?.[JOBS_QUEUE_PARAM])
  const state = resolveJobState(req.query?.[JOBS_STATE_PARAM])

  const clauses: Where[] = []

  if (queue) {
    clauses.push({
      queue: {
        equals: queue,
      },
    })
  } else {
    clauses.push({
      queue: {
        not_equals: QueueSlug.Heartbeat,
      },
    })
  }

  if (state) {
    clauses.push(stateWhere(state, Date.now()))
  }

  if (clauses.length === 1) return clauses[0]

  return {
    and: clauses,
  }
}
