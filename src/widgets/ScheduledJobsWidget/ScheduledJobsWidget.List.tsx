'use client'

import { useState } from 'react'

import { QueueSlug } from '@/types/jobs-queue'
import type { PayloadJob } from '@/types/payload'

import { ScheduledJobsWidgetClient } from './ScheduledJobsWidget.client'
import { Header } from './ScheduledJobsWidget.Header'

// Every known queue, not just the ones with jobs pending right now — so a
// queue that's currently empty (e.g. resume-generation between runs) still
// shows up as a selectable option instead of only appearing once it has work.
// `HeartbeatQueue` is excluded: its jobs never reach `jobs` (filtered out
// upstream in `fetchScheduledJobs`), so it would only ever show up empty.
const ALL_QUEUES: string[] = Object.values(QueueSlug)
  .filter((queue) => queue !== QueueSlug.Heartbeat)
  .sort()

interface ScheduledJobsWidgetListProps {
  jobs: PayloadJob[]
}

/**
 * Wraps the per-job widgets with a shared header: a queue select (styled
 * like Umami's date-range button) plus prev/next arrows that cycle through
 * all known queues. Filtering happens client-side against the
 * already-fetched job list — there's no reason to round-trip to the server
 * for this since `jobs` is small and already loaded.
 */
export const ScheduledJobsWidgetList = ({ jobs }: ScheduledJobsWidgetListProps) => {
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null)

  const handleMoveQueue = (direction: 1 | -1) => {
    if (selectedQueue === null) {
      setSelectedQueue(direction === 1 ? ALL_QUEUES[0] : ALL_QUEUES[ALL_QUEUES.length - 1])
      return
    }

    const currentIndex = ALL_QUEUES.indexOf(selectedQueue)
    const nextIndex = currentIndex + direction

    // Stepping past either end returns to "All Queues" rather than
    // wrapping, so the cycle is All -> queue 1 -> ... -> queue N -> All.
    if (nextIndex < 0 || nextIndex >= ALL_QUEUES.length) {
      setSelectedQueue(null)
      return
    }

    setSelectedQueue(ALL_QUEUES[nextIndex])
  }

  const visibleJobs = selectedQueue ? jobs.filter((job) => job.queue === selectedQueue) : jobs

  return (
    <div className="pb-12">
      <div className="flex flex-row justify-between items-center py-8">
        <Header
          queues={ALL_QUEUES}
          selectedQueue={selectedQueue}
          onSelectQueue={setSelectedQueue}
          onMoveQueue={handleMoveQueue}
        />
      </div>

      {visibleJobs.length > 0 ? (
        visibleJobs.map((job) => <ScheduledJobsWidgetClient key={job.id} {...job} />)
      ) : (
        <div className="px-4 pb-6 font-mono text-sm opacity-60">
          {selectedQueue ? `No scheduled jobs in "${selectedQueue}"` : 'No scheduled jobs'}
        </div>
      )}
    </div>
  )
}
