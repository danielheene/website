'use client'

import { type JSX, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { secondsToMilliseconds } from 'date-fns'
import { cn } from 'tailwind-variants'

import { Badge, type BadgeProps } from '@/components/Badge'
import { type OverallStatus, OverallStatusCode } from '@/lib/uptime-kuma'

interface ServiceStatusProps {
  className?: string
  fetchStatus: () => Promise<OverallStatus | null>
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
}: ServiceStatusProps): JSX.Element => {
  const timeoutRef = useRef<NodeJS.Timeout>(null)
  const [status, setStatus] = useState<OverallStatus | null>(null)

  useEffect(() => {
    const updateData = () => {
      fetchStatus().then(setStatus)
      timeoutRef.current = setTimeout(updateData, secondsToMilliseconds(30))
    }

    if (!timeoutRef.current) updateData()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [
    fetchStatus,
  ])

  return (
    status && (
      <Badge
        asChild
        color={STATUS_BADGE_COLOR[status.code]}
        style="light"
        className={cn([
          'gap-2 transition-colors',
          // 'hover:bg-[color-mix(in_oklab,var(--badge-color)_35%,var(--color-white)_65%)]',
          className,
        ])}
      >
        <Link href={process.env.STATUS_PAGE_URL} target="_blank" rel="noopener noreferrer">
          {status.code !== OverallStatusCode.NoServices && (
            <span
              className={cn([
                'relative inline-flex w-2 h-2',
                'before:inline-flex before:w-2 before:h-2 before:bg-current before:rounded-full',
                'after:inline-flex after:absolute after:w-full after:h-full after:bg-current after:rounded-full after:animate-ping after:opacity-75',
              ])}
            />
          )}
          <span>{status.message}</span>
        </Link>
      </Badge>
    )
  )
}
