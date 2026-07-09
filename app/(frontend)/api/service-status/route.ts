import {
  type Heartbeat,
  type HeartbeatResponse,
  HeartbeatStatus,
  OverallStatus,
  type OverallStatusResponse,
} from '@/types/uptime-kuma'

export const revalidate = 60

/**
 *
 * @constructor
 */
export const GET = async () => {
  if (!process.env.STATUS_PAGE_HEARTBEAT_URL) {
    console.error('STATUS_PAGE_HEARTBEAT_URL is not set')
    return new Response('Not configured', {
      status: 500,
    })
  }

  try {
    console.info('Fetching status...')
    const { heartbeatList }: HeartbeatResponse = await fetch(
      process.env.STATUS_PAGE_HEARTBEAT_URL,
    ).then((res) => res.json())
    const latestHeartbeats = Object.values(heartbeatList).map(
      (heartbeats) => heartbeats[heartbeats.length - 1],
    )
    const code = resolveOverallStatus(latestHeartbeats)
    const message = resolveOverallStatusMessage(code)

    console.info('Status fetched successfully')
    return Response.json({
      code,
      message,
    } as OverallStatusResponse)
  } catch (error) {
    console.error('Error fetching status:', error)
    return new Response('Error fetching status', {
      status: 500,
    })
  }
}

/**
 * Resolves the overall status of the system based on the provided heartbeats.
 * @param heartbeats - The list of heartbeats to evaluate.
 * @returns The overall status of the system.
 */
function resolveOverallStatus(heartbeats: Heartbeat[]): OverallStatus {
  const statuses = heartbeats.map((heartbeat) => heartbeat.status)

  if (statuses.length === 0) {
    return OverallStatus.NoServices
  }
  if (statuses.every((status) => status === HeartbeatStatus.Down)) {
    return OverallStatus.AllDown
  }
  if (statuses.some((status) => status === HeartbeatStatus.Down)) {
    return OverallStatus.PartialDown
  }
  if (statuses.some((status) => status === HeartbeatStatus.Maintenance)) {
    return OverallStatus.Maintenance
  }
  return OverallStatus.AllUp
}

/**
 * Resolves the message to display for the overall status of the system.
 * @param overallStatus - The overall status of the system.
 * @returns The message to display for the overall status of the system.
 */
function resolveOverallStatusMessage(overallStatus: OverallStatus): string {
  switch (overallStatus) {
    case OverallStatus.AllDown:
      return 'Degraded Service'
    case OverallStatus.PartialDown:
      return 'Partially Degraded Service'
    case OverallStatus.Maintenance:
      return 'Under Maintenance'
    case OverallStatus.NoServices:
      return 'No Services Available'
    default:
      return 'All Systems Operational'
  }
}
