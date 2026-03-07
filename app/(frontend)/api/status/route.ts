import {
  type InternalStatusResponse,
  type UptimeKumaHeartbeat,
  type UptimeKumaHeartbeatResponse,
  UptimeKumaHeartbeatStatus,
  UptimeKumaOverallStatus,
} from '@custom-types'
import { logger } from '@/lib/otel/logger'

/**
 *
 * @constructor
 */
export const GET = async () => {
  if (!process.env.STATUS_PAGE_HEARTBEAT_API_URL) {
    logger.error('STATUS_PAGE_HEARTBEAT_API_URL is not set')
    return new Response('Not configured', { status: 500 })
  }

  try {
    logger.info('Fetching status...')
    const { heartbeatList }: UptimeKumaHeartbeatResponse = await fetch(process.env.STATUS_PAGE_HEARTBEAT_API_URL).then((res) => res.json())
    const latestHeartbeats = Object.values(heartbeatList).map((heartbeats) => heartbeats[heartbeats.length - 1])
    const code = resolveOverallStatus(latestHeartbeats)
    const message = resolveOverallStatusMessage(code)

    logger.info('Status fetched successfully')
    return Response.json({
      code,
      message,
    } as InternalStatusResponse)
  } catch (error) {
    logger.error('Error fetching status:', error)
    return new Response('Error fetching status', { status: 500 })
  }
}

/**
 * Resolves the overall status of the system based on the provided heartbeats.
 * @param heartbeats - The list of heartbeats to evaluate.
 * @returns The overall status of the system.
 */
function resolveOverallStatus(heartbeats: UptimeKumaHeartbeat[]): UptimeKumaOverallStatus {
  const statuses = heartbeats.map((heartbeat) => heartbeat.status)

  if (statuses.length === 0) {
    return UptimeKumaOverallStatus.NoServices
  }
  if (statuses.every((status) => status === UptimeKumaHeartbeatStatus.Down)) {
    return UptimeKumaOverallStatus.AllDown
  }
  if (statuses.some((status) => status === UptimeKumaHeartbeatStatus.Down)) {
    return UptimeKumaOverallStatus.PartialDown
  }
  if (statuses.some((status) => status === UptimeKumaHeartbeatStatus.Maintenance)) {
    return UptimeKumaOverallStatus.Maintenance
  }
  return UptimeKumaOverallStatus.AllUp
}

/**
 * Resolves the message to display for the overall status of the system.
 * @param overallStatus - The overall status of the system.
 * @returns The message to display for the overall status of the system.
 */
function resolveOverallStatusMessage(overallStatus: UptimeKumaOverallStatus): string {
  switch (overallStatus) {
    case UptimeKumaOverallStatus.AllDown:
      return 'Degraded Service'
    case UptimeKumaOverallStatus.PartialDown:
      return 'Partially Degraded Service'
    case UptimeKumaOverallStatus.Maintenance:
      return 'Under Maintenance'
    case UptimeKumaOverallStatus.NoServices:
      return 'No Services Available'
    default:
      return 'All Systems Operational'
  }
}
