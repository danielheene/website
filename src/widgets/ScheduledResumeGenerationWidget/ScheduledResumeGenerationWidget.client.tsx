'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@payloadcms/ui'

import { formatDistanceToNow } from 'date-fns'

import { runResumeGenerationJobNow } from '@/lib/actions/runResumeGenerationJobNow'

type Props = {
  jobId: string
  /** ISO timestamp */
  createdAt: string
  /** ISO timestamp */
  waitUntil: string
}

/** How often the countdown/progress bar re-renders. */
const TICK_INTERVAL_MS = 1000

/** How often the widget checks whether the job finished outside "Run now" (e.g. the cron poll). */
const POLL_INTERVAL_MS = 30 * 1000

/**
 * Percentage of the wait between `createdAt` and `waitUntil` that has
 * elapsed as of `now`, clamped to [0, 100].
 */
export const calculateJobProgress = (createdAt: string, waitUntil: string, now: Date): number => {
  const createdAtMs = new Date(createdAt).getTime()
  const waitUntilMs = new Date(waitUntil).getTime()
  const nowMs = now.getTime()

  const totalMs = waitUntilMs - createdAtMs
  if (totalMs <= 0) {
    return 100
  }

  const elapsedMs = nowMs - createdAtMs
  return Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100))
}

export const ScheduledResumeGenerationWidgetClient = ({ jobId, createdAt, waitUntil }: Props) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), TICK_INTERVAL_MS)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    const poll = setInterval(() => router.refresh(), POLL_INTERVAL_MS)
    return () => clearInterval(poll)
  }, [
    router,
  ])

  const progress = calculateJobProgress(createdAt, waitUntil, now)
  const isDue = progress >= 100
  const remainingLabel = isDue ? 'Due now' : `Runs in ${formatDistanceToNow(new Date(waitUntil))}`

  const handleRunNow = () => {
    startTransition(async () => {
      await runResumeGenerationJobNow(jobId)
      router.refresh()
    })
  }

  return (
    <div className="card">
      <div className="card__title">Resume document generation scheduled</div>

      <div className="flex flex-col gap-2 p-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-primary-500 transition-[width] duration-1000 ease-linear"
            style={{
              width: `${progress}%`,
            }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-white/60">{remainingLabel}</span>

          <Button type="button" onClick={handleRunNow} disabled={isPending}>
            {isPending ? 'Running…' : 'Run now'}
          </Button>
        </div>
      </div>
    </div>
  )
}
