export enum HeartbeatStatusCode {
  Down = 0,
  Up = 1,
  Pending = 2,
  Maintenance = 3,
}

export enum OverallStatusCode {
  AllDown = 0,
  AllUp = 1,
  PartialDown = 2,
  Maintenance = 3,
  NoServices = -1,
}

export interface Heartbeat {
  status: HeartbeatStatusCode
  time: string
  msg: string
  ping: number
}

export interface HeartbeatResponse {
  heartbeatList: {
    [key: string]: Heartbeat[]
  }
  uptimeList: {
    [key: string]: number
  }
}

export interface OverallStatus {
  code: OverallStatusCode
  message: string
}

/**
 * Resolves the overall status of the system based on the provided heartbeats.
 * @param heartbeats - The list of heartbeats to evaluate.
 * @returns The overall status of the system.
 */
export function resolveOverallStatusCode(heartbeats: Heartbeat[]): OverallStatusCode {
  const statuses = heartbeats.map((heartbeat) => heartbeat.status)

  if (statuses.length === 0) {
    return OverallStatusCode.NoServices
  }
  if (statuses.every((status) => status === HeartbeatStatusCode.Down)) {
    return OverallStatusCode.AllDown
  }
  if (statuses.some((status) => status === HeartbeatStatusCode.Down)) {
    return OverallStatusCode.PartialDown
  }
  if (statuses.some((status) => status === HeartbeatStatusCode.Maintenance)) {
    return OverallStatusCode.Maintenance
  }
  return OverallStatusCode.AllUp
}

/**
 * Resolves the message to display for the overall status of the system.
 * @param overallStatus - The overall status of the system.
 * @returns The message to display for the overall status of the system.
 */
export function resolveOverallStatusMessage(overallStatus: OverallStatusCode): string {
  switch (overallStatus) {
    case OverallStatusCode.AllDown:
      return 'Degraded Service'
    case OverallStatusCode.PartialDown:
      return 'Partially Degraded Service'
    case OverallStatusCode.Maintenance:
      return 'Under Maintenance'
    case OverallStatusCode.NoServices:
      return 'No Services Available'
    default:
      return 'All Systems Operational'
  }
}
