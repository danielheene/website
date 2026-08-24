import { Suspense } from 'react'
import { cacheLife, cacheTag } from 'next/cache'

import { ServiceStatusClient } from '@/components/ServiceStatus/ServiceStatus.client'
import { extractErrorMessage } from '@/lib/extractErrorMessage'
import {
  HeartbeatResponse,
  OverallStatus,
  resolveOverallStatusCode,
  resolveOverallStatusMessage,
} from '@/lib/uptime-kuma'

const fetchStatus = async () => {
  'use cache'
  cacheTag('service-status')
  cacheLife('minutes')

  if (!process.env.STATUS_PAGE_HEARTBEAT_URL) {
    console.error('STATUS_PAGE_HEARTBEAT_URL is not set')
    return null
  }

  try {
    console.info('Fetching status...')
    const response = await fetch(process.env.STATUS_PAGE_HEARTBEAT_URL, {
      cache: 'force-cache',
    })
    if (!response.ok) {
      console.error('Error fetching status:', response.statusText)
      return null
    }

    const { heartbeatList }: HeartbeatResponse = await response.json()
    const latestHeartbeats = Object.values(heartbeatList).map(
      (heartbeats) => heartbeats[heartbeats.length - 1],
    )
    const code = resolveOverallStatusCode(latestHeartbeats)
    const message = resolveOverallStatusMessage(code)

    console.info('Status fetched successfully')
    return {
      code,
      message,
    } as OverallStatus
  } catch (error) {
    console.error('Error fetching status:', extractErrorMessage(error))
    return null
  }
}

interface ServiceStatusProps {
  className?: string
}

export const ServiceStatus = async ({ className }: ServiceStatusProps = {}) => {
  return (
    <Suspense>
      <ServiceStatusClient className={className} fetchStatus={fetchStatus} />
    </Suspense>
  )
}
