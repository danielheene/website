'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useListDrawerContext } from '@payloadcms/ui'

import {
  JOBS_QUEUE_PARAM,
  JOBS_STATE_PARAM,
  JobState,
  resolveJobQueue,
  resolveJobState,
} from '@/jobs-queue/lib/jobsListFilter'
import { QueueSlug } from '@/types/jobs-queue'

import { RotatingFilter } from './RotatingFilter'

import './JobsQueueTabs.styles.css'

// `QueueSlug.Heartbeat` stays selectable — its jobs are just excluded from
// "All queues" by default (see `scopeJobsList`) — so an admin who does want
// to check on the liveness signal can still filter to it explicitly.
const QUEUES: string[] = Object.values(QueueSlug)

const STATES: string[] = Object.values(JobState)

/**
 * Two independently-combinable rotating filters for the `payload-jobs` admin
 * list — queue and state, each the same `[prev][dropdown][next]` control as
 * the dashboard's `ScheduledJobsWidget` queue selector, placed inline next to
 * each other. Each writes its own query parameter that `scopeJobsList` (the
 * collection's `baseFilter`) reads, so selecting a queue and a state at once
 * narrows to their intersection.
 *
 * Rendered through the collection's `Description` slot — see
 * `MediaScopeTabs` for why that is the closest supported extension point.
 */
export const JobsQueueTabs = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isInDrawer } = useListDrawerContext()

  const activeQueue = resolveJobQueue(searchParams.get(JOBS_QUEUE_PARAM))
  const activeState = resolveJobState(searchParams.get(JOBS_STATE_PARAM))

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }

      // Row counts differ between filters, so the current page does not
      // carry over.
      params.delete('page')

      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    },
    [
      pathname,
      router,
      searchParams,
    ],
  )

  const selectQueue = useCallback(
    (queue: string | null) => setParam(JOBS_QUEUE_PARAM, queue),
    [
      setParam,
    ],
  )

  const selectState = useCallback(
    (state: string | null) => setParam(JOBS_STATE_PARAM, state),
    [
      setParam,
    ],
  )

  // Same reasoning as `MediaScopeTabs`: meaningless in a drawer or on a
  // document view, and would navigate away from a document if clicked there.
  const isListView = /\/collections\/[^/]+$/.test(pathname)

  if (isInDrawer || !isListView) return null

  return (
    <div className="jobs-queue-tabs">
      <RotatingFilter
        ariaLabel="Queue"
        allLabel="All queues"
        options={QUEUES}
        selected={activeQueue}
        onSelect={selectQueue}
      />
      <RotatingFilter
        ariaLabel="State"
        allLabel="All states"
        options={STATES}
        selected={activeState}
        onSelect={selectState}
      />
    </div>
  )
}

export default JobsQueueTabs
