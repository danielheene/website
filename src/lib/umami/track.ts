import { sendUmamiPayload } from './sendUmamiPayload'
import type { TrackFunction, UmamiSendPayload, UmamiSendPayloadPayload } from './Umami.types'

const isBrowser = () => typeof window !== 'undefined'

/**
 * Directly-importable, isomorphic replacement for Umami's script-injected
 * `track()` global. Builds a payload from browser globals (when available)
 * plus the caller-supplied event name/data and fires it via
 * `sendUmamiPayload`, without awaiting or surfacing its result.
 *
 * doNotTrack/domains suppression will be wired in by TASK-005; this function
 * intentionally omits it for now.
 */
export const track: TrackFunction = (
  eventNameOrData?:
    | string
    | Record<string, unknown>
    | ((data: Record<string, unknown>) => Record<string, unknown>),
  data?: Record<string, unknown>,
): void => {
  let name: string | undefined
  let eventData: Record<string, unknown> | undefined

  if (typeof eventNameOrData === 'string') {
    name = eventNameOrData
    eventData = data
  } else if (typeof eventNameOrData === 'function') {
    eventData = eventNameOrData({})
  } else if (typeof eventNameOrData === 'object' && eventNameOrData !== null) {
    eventData = eventNameOrData
  }

  const payload: UmamiSendPayloadPayload = {
    website: process.env.NEXT_PUBLIC_UMAMI_SITE_ID ?? '',
    ...(name
      ? {
          name,
        }
      : {}),
    ...(eventData
      ? {
          data: eventData,
        }
      : {}),
  }

  if (isBrowser()) {
    payload.url = location.pathname + location.search
    payload.hostname = location.hostname
    payload.language = navigator.language
    payload.screen = `${screen.width}x${screen.height}`
    payload.title = document.title

    if (document.referrer) {
      payload.referrer = document.referrer
    }
  }

  const sendPayload: UmamiSendPayload = {
    type: 'event',
    payload,
  }

  void sendUmamiPayload(sendPayload)
}
