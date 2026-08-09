/**
 *    Channels the SSE endpoint is allowed to subscribe to.
 *
 *    `/api/sse` is unauthenticated, so the `channel` query parameter must never
 *    reach `redis.subscribe()` unchecked — otherwise any visitor can attach to
 *    an arbitrary Pub/Sub channel and read whatever is published there.
 *
 *    Add a channel here before streaming it to the browser.
 */
export const SSE_CHANNELS = [
  'service-status',
] as const

export type SseChannel = (typeof SSE_CHANNELS)[number]

/**
 * Narrows an untrusted query-string value to a known channel.
 */
export const isSseChannel = (value: string | null): value is SseChannel =>
  value !== null && (SSE_CHANNELS as readonly string[]).includes(value)
