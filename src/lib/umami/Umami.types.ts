export interface UmamiSendPayloadPayload {
  website: string
  url?: string
  referrer?: string
  hostname?: string
  language?: string
  screen?: string
  title?: string
  name?: string
  data?: Record<string, unknown>
}

export interface UmamiSendPayload {
  payload: UmamiSendPayloadPayload
  type: 'event'
}
