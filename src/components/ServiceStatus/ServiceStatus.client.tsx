'use client'

import { type JSX, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { secondsToMilliseconds } from 'date-fns'
import { cn } from 'tailwind-variants'

import { type OverallStatus, OverallStatusCode } from '@/lib/uptime-kuma'

interface ServiceStatusProps {
  className?: string
  fetchStatus: () => Promise<OverallStatus | null>
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
      <Link
        href={process.env.STATUS_PAGE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn([
          'inline-flex gap-2 items-center grow-0 shrink-0 font-mono text-sm',
          'border rounded-sm px-2 py-1 transition-colors',

          status.code === OverallStatusCode.NoServices && [
            'text-neutral-600 border-neutral bg-neutral-300/10 hover:bg-neutral-300/20',
            'dark:text-neutral dark:border-neutral dark:bg-neutral/5 dark:hover:bg-neutral/10',
          ],
          status.code === OverallStatusCode.PartialDown && [
            'text-warning-600 border-warning bg-warning-300/10 hover:bg-warning-300/20',
            'dark:text-warning dark:border-warning dark:bg-warning/5 dark:hover:bg-warning/10',
          ],
          status.code === OverallStatusCode.AllDown && [
            'text-error-600 border-error bg-error-300/10 hover:bg-error-300/20',
            'dark:text-error dark:border-error dark:bg-error/5 dark:hover:bg-error/10',
          ],
          status.code === OverallStatusCode.Maintenance && [
            'text-info-600 border-info bg-info-300/10 hover:bg-info-300/20',
            'dark:text-info dark:border-info dark:bg-info/5 dark:hover:bg-info/10',
          ],
          status.code === OverallStatusCode.AllUp && [
            'text-success-600 border-success bg-success-300/10 hover:bg-success-300/20',
            'dark:text-success dark:border-success dark:bg-success/5 dark:hover:bg-success/10',
          ],

          className,
        ])}
      >
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
    )
  )
}
