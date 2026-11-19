'use client'

import { type JSX, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { secondsToMilliseconds } from 'date-fns'
import { cn } from 'tailwind-variants'

import { Badge, type BadgeProps } from '@/components/Badge'
import { type OverallStatus, OverallStatusCode } from '@/lib/uptime-kuma'

interface ServiceStatusProps {
  className?: string
  fetchStatus: () => Promise<OverallStatus | null>
  initialStatus: OverallStatus | null
}

/** Maps each overall status to the Badge color that carries the same meaning. */
const STATUS_BADGE_COLOR: Record<OverallStatusCode, BadgeProps['color']> = {
  [OverallStatusCode.NoServices]: 'neutral',
  [OverallStatusCode.PartialDown]: 'warning',
  [OverallStatusCode.AllDown]: 'error',
  [OverallStatusCode.Maintenance]: 'info',
  [OverallStatusCode.AllUp]: 'success',
}

export const ServiceStatusClient = ({
  className,
  fetchStatus,
  initialStatus,
}: ServiceStatusProps): JSX.Element => {
  const fetchIntervalRef = useRef<NodeJS.Timeout>(null)
  const [status, setStatus] = useState<OverallStatus | null>(initialStatus)

  const processStatusFetching = useCallback(() => {
    fetchStatus()
      .then((status) => setStatus(status))
      .catch((error) => console.error(error))
  }, [fetchStatus])

  useEffect(() => {
    fetchIntervalRef.current = setInterval(processStatusFetching, secondsToMilliseconds(60))

    return () => {
      if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current)
    }
  }, [processStatusFetching])

  if (!status) return null

  return (
    <Badge
      asChild
      color={STATUS_BADGE_COLOR[status.code]}
      style="outline"
      size="lg"
      className={cn(['gap-2 transition-colors', className])}
    >
      <Link
        href={process.env.NEXT_PUBLIC_STATUS_PAGE_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {status.code !== OverallStatusCode.NoServices && (
          <span
            className={cn([
              'relative inline-flex size-2',
              'before:inline-flex before:size-2 before:rounded-full before:bg-current',
              'after:absolute after:inline-flex after:size-full after:animate-ping after:rounded-full after:bg-current after:opacity-75',
            ])}
          />
        )}
        <span>{status.message}</span>
      </Link>
    </Badge>
  )
}
