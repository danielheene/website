'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@payloadcms/ui'

import { startCase } from 'lodash-es'

import { Banner } from '@/components/Banner'
import { Button } from '@/components/Button'
import { cancelScheduledJob } from '@/lib/actions/cancelScheduledJob'
import { rescheduleJob } from '@/lib/actions/rescheduleJob'

interface StatusBannerItemProps {
  id: string
  jobName: string
  /** ISO timestamp — already confirmed to be in the past */
  waitUntil: string
}

export const StatusBannerItem = ({ id, jobName, waitUntil }: StatusBannerItemProps) => {
  const router = useRouter()
  const [isRescheduling, startReschedule] = useTransition()
  const [isDeleting, startDelete] = useTransition()

  const isPending = isRescheduling || isDeleting

  const overdueSince = Math.round((Date.now() - new Date(waitUntil).getTime()) / 60_000)
  const overdueLabel =
    overdueSince < 1 ? 'just now' : overdueSince === 1 ? '1 min ago' : `${overdueSince} mins ago`

  const handleReschedule = () => {
    startReschedule(async () => {
      const result = await rescheduleJob(id)
      if (result.ok) {
        toast.success(`${startCase(jobName)} rescheduled`)
        router.refresh()
      } else {
        toast.error(result.error ?? 'Reschedule failed')
      }
    })
  }

  const handleDelete = () => {
    startDelete(async () => {
      await cancelScheduledJob(id)
      router.refresh()
    })
  }

  return (
    <Banner variant="warning">
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-mono font-medium leading-tight">
            {startCase(jobName)}: detected as stale job
          </span>
          <span className="text-xs font-mono opacity-60 leading-none">
            Due {overdueLabel} — stuck in queue
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={handleReschedule}
            disabled={isPending}
            endIcon={isRescheduling ? '' : 'material-symbols:refresh'}
          >
            {isRescheduling ? 'Rescheduling…' : 'Reschedule'}
          </Button>
          <Button
            type="button"
            size="xs"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            endIcon={isDeleting ? '' : 'material-symbols:delete-outline'}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </Banner>
  )
}
