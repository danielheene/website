import { sendUmamiPayload } from './sendUmamiPayload'
import type { TrackFunction, UmamiSendPayload, UmamiSendPayloadPayload } from './Umami.types'

declare global {
  interface Window {
    /**
     * Set by `UmamiSuppressionFlag` (an inline script rendered from the root
     * layout) when the current request's authenticated Payload session
     * should be excluded from analytics. `isTrackingSuppressed()` can only
     * run server-side (it reads/JWT-verifies the `payload-token` cookie via
     * `cookies()`), so this flag is how that decision reaches client-side
     * `track()` calls.
     */
    __UMAMI_SUPPRESSED__?: boolean
  }
}

const isBrowser = () => typeof window !== 'undefined'

const isDoNotTrackEnabled = () => process.env.NEXT_PUBLIC_UMAMI_DO_NOT_TRACK === 'true'

const getAllowedDomains = (): string[] =>
  (process.env.NEXT_PUBLIC_UMAMI_DOMAINS ?? '')
    .split(',')
    .map((domain) => domain.trim())
    .filter(Boolean)

/**
 * Determines whether `track()` should send its payload, based on the
 * `NEXT_PUBLIC_UMAMI_DO_NOT_TRACK`/`NEXT_PUBLIC_UMAMI_DOMAINS` config. Both
 * are optional; when unset, tracking is neither suppressed nor restricted to
 * specific domains.
 */
export const isTrackingAllowed = (): boolean => {
  if (isDoNotTrackEnabled()) {
    return false
  }

  const allowedDomains = getAllowedDomains()

  if (allowedDomains.length > 0 && isBrowser() && !allowedDomains.includes(location.hostname)) {
    return false
  }

  return true
}

/**
 * Directly-importable, isomorphic replacement for Umami's script-injected
 * `track()` global. Builds a payload from browser globals (when available)
 * plus the caller-supplied event name/data and fires it via
 * `sendUmamiPayload`, without awaiting or surfacing its result. Honors the
 * `NEXT_PUBLIC_UMAMI_DO_NOT_TRACK`/`NEXT_PUBLIC_UMAMI_DOMAINS` config, and (in
 * the browser) the `window.__UMAMI_SUPPRESSED__` flag set for authenticated
 * Payload sessions, no-oping when tracking is suppressed or the current
 * domain isn't allowed.
 */
export const track: TrackFunction = (
  eventNameOrData?:
    | string
    | Record<string, unknown>
    | ((data: Record<string, unknown>) => Record<string, unknown>),
  data?: Record<string, unknown>,
): void => {
  if (isBrowser() && window.__UMAMI_SUPPRESSED__ === true) {
    return
  }

  if (!isTrackingAllowed()) {
    return
  }

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
