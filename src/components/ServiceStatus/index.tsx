'use client'

import { cn } from '@/utilities/cn'
import { InternalStatusResponse, UptimeKumaOverallStatus } from '@custom-types'
import Link from 'next/link'
import { JSX, useEffect, useState } from 'react'

interface ServiceStatusProps {
  className?: string
}

export const ServiceStatus = ({ className }: ServiceStatusProps): JSX.Element => {
  const [status, setStatus] = useState<InternalStatusResponse | null>(null)

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then(setStatus)
  }, [])

  return status ? (
    <Link
      href={process.env.NEXT_PUBLIC_STATUS_PAGE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn([
        'inline-flex gap-2 items-center grow-0 shrink-0 font-mono text-sm',
        'border border-current/40 rounded-sm px-2 py-1',
        'transition-colors bg-current/0 hover:bg-current/10',
        status.code === UptimeKumaOverallStatus.NoServices && 'text-neutral-500',
        status.code === UptimeKumaOverallStatus.PartialDown && 'text-warning',
        status.code === UptimeKumaOverallStatus.AllDown && 'text-error',
        status.code === UptimeKumaOverallStatus.Maintenance && 'text-info',
        status.code === UptimeKumaOverallStatus.AllUp && 'text-success',
        className,
      ])}
    >
      {status.code !== UptimeKumaOverallStatus.NoServices && (
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
  ) : (
    <span className={cn(className)} />
  )
}
