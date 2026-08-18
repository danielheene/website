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

export interface TrackFunction {
  (): void
  (eventName: string): void
  (data: Record<string, unknown>): void
  (eventName: string, data: Record<string, unknown>): void
  (fn: (data: Record<string, unknown>) => Record<string, unknown>): void
}
