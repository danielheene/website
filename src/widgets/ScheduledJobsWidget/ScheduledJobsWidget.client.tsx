'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@payloadcms/ui'

import { format, formatDistanceToNow } from 'date-fns'
import { cn } from 'tailwind-variants'

import { Button } from '@/components/Button'
import { useServerSentEvents } from '@/components/hooks/use-server-sent-events'
import { cancelScheduledJob } from '@/lib/actions/cancelScheduledJob'
import { runScheduledJobNow } from '@/lib/actions/runScheduledJobNow'
import { type ScheduledJobActionProgress, scheduledJobChannel } from '@/lib/sse/channels'
import { PayloadJob } from '@/types/payload'

/** How often the countdown/progress bar re-renders. */
const TICK_INTERVAL_MS = 10000

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

export const ScheduledJobsWidgetClient = ({
  id,
  createdAt,
  waitUntil,
  taskSlug,
  workflowSlug,
}: PayloadJob) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isCancelling, startCancelTransition] = useTransition()
  const [now, setNow] = useState(() => new Date())

  const handleActionResult = useCallback(
    (data: ScheduledJobActionProgress) => {
      switch (data.status) {
        case 'success':
          toast.success('Run succeeded', {
            id,
          })
          router.refresh()
          return
        case 'cancelled':
          toast('Cancelled', {
            id,
          })
          router.refresh()
          return
        case 'error':
          toast.error(`${isCancelling ? 'Cancel failed' : 'Run failed'}: ${data.message}`, {
            id,
          })
          return
      }
    },
    [
      id,
      isCancelling,
      router,
    ],
  )

  // Listens for the outcome of a manually-triggered "Run now" or "Cancel" —
  // published by `runScheduledJobNow`/`cancelScheduledJob` once the action
  // settles. Only open while one of those is in flight; the cron-triggered
  // path has no publisher on this channel, so there's nothing to listen for
  // otherwise.
  useServerSentEvents<ScheduledJobActionProgress>({
    channel: scheduledJobChannel(id),
    enabled: isPending || isCancelling,
    onMessage: handleActionResult,
  })

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
      await runScheduledJobNow(id)
      router.refresh()
    })
  }

  const handleCancel = () => {
    startCancelTransition(async () => {
      await cancelScheduledJob(id)
      router.refresh()
    })
  }

  return (
    <div
      className={cn([
        'bg-card border-border border flex flex-row justify-end items-center gap-4  px-4 pt-3 pb-4',
        'relative',
      ])}
    >
      <div
        className={cn([
          'flex flex-col gap-1 mr-auto',
        ])}
      >
        <span className="text-lg leading-none font-mono font-medium">
          {taskSlug ?? workflowSlug}
        </span>
        <span className="text-sm leading-none font-mono opacity-60">
          {remainingLabel} [{format(waitUntil, 'p')}]
        </span>
      </div>

      <div className="absolute left-0 bottom-0 right-0 h-1 w-full overflow-hidden  bg-white/10">
        <div
          className="h-full  bg-primary-500 transition-[width] duration-1000 ease-linear"
          style={{
            width: `${progress}%`,
          }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <Button
        type="button"
        onClick={handleRunNow}
        disabled={isPending || isCancelling}
        endIcon={isPending ? '' : 'material-symbols:rocket-launch'}
      >
        {isPending ? 'Running…' : 'Run now'}
      </Button>
      <Button
        type="button"
        size="icon"
        variant="outline"
        startIcon="material-symbols:close-sharp"
        onClick={handleCancel}
        disabled={isPending || isCancelling}
        aria-label="Cancel scheduled job"
      />
    </div>
  )
}
