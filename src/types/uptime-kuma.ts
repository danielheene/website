export enum HeartbeatStatus {
  Down = 0,
  Up = 1,
  Pending = 2,
  Maintenance = 3,
}

export enum OverallStatus {
  AllDown = 0,
  AllUp = 1,
  PartialDown = 2,
  Maintenance = 3,
  NoServices = -1,
}

export interface Heartbeat {
  status: HeartbeatStatus
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

export interface OverallStatusResponse {
  code: OverallStatus
  message: string
}
