'use server'

import { minutesToSeconds } from 'date-fns'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { get, set } from '@/lib/RedisHandler'
import {
  HeartbeatResponse,
  OverallStatus,
  resolveOverallStatusCode,
  resolveOverallStatusMessage,
} from '@/lib/uptime-kuma'

const CACHE_KEY = 'service-status'

// Short enough that an outage still shows up quickly, long enough to spare
// the heartbeat URL from every client's independent poll.
const CACHE_TTL_SECONDS = minutesToSeconds(5)

/**
 * `ServiceStatusClient` calls this directly as a server action to poll live
 * status, so a Redis cache (rather than `'use cache'`) is what keeps a burst
 * of concurrently rendering/polling clients from each hitting the heartbeat
 * URL themselves.
 */
export const fetchServiceStatus = async (): Promise<OverallStatus | null> => {
  const cached = await get<OverallStatus>(CACHE_KEY)

  if (cached) return cached

  if (!process.env.STATUS_PAGE_HEARTBEAT_URL) {
    console.error('STATUS_PAGE_HEARTBEAT_URL is not set')

    return null
  }

  try {
    const response = await fetch(process.env.STATUS_PAGE_HEARTBEAT_URL, {
      cache: 'no-cache',
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

    const status = {
      code,
      message,
    } satisfies OverallStatus

    await set(CACHE_KEY, status, CACHE_TTL_SECONDS)

    return status
  } catch (error) {
    console.error('Error fetching status:', extractErrorMessage(error))

    return null
  }
}
