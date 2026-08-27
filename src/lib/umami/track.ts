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

/**
 * Path prefix for the Payload admin panel (see `app/(payload)/`). Excluded
 * from tracking unconditionally — regardless of `__UMAMI_SUPPRESSED__` state
 * — since visits to `/admin` (including by anonymous visitors who just hit
 * the login screen) should never show up in analytics. This matters because
 * `instrumentation-client.ts` fires `trackPageview()` for every page load
 * and every client-side route transition app-wide, not just within the
 * `(frontend)` route group, so `/admin` needs its own explicit exclusion.
 */
const ADMIN_PATH_PREFIX = '/admin'

const isAdminPath = (pathname: string): boolean =>
  pathname === ADMIN_PATH_PREFIX || pathname.startsWith(`${ADMIN_PATH_PREFIX}/`)

/**
 * True when `url` (or, if omitted, the current `location.pathname`) targets
 * the admin panel. Accepts both relative paths and absolute URLs.
 */
const isAdminUrl = (url?: string): boolean => {
  const candidate = url ?? (isBrowser() ? location.pathname : undefined)

  if (!candidate) {
    return false
  }

  try {
    return isAdminPath(
      new URL(candidate, isBrowser() ? location.origin : 'http://localhost').pathname,
    )
  } catch {
    return isAdminPath(candidate)
  }
}

/**
 * Shared guard used by both `track()` and `trackPageview()`: true when the
 * current session was flagged suppressed (`window.__UMAMI_SUPPRESSED__`, set
 * by `UmamiSuppressionFlag` for authenticated Payload sessions), or when the
 * current/target URL falls under the Payload admin panel (`/admin`).
 */
const shouldSuppressTracking = (url?: string): boolean =>
  (isBrowser() && window.__UMAMI_SUPPRESSED__ === true) || isAdminUrl(url)

/**
 * Populates the browser-derived fields (hostname/language/screen/title/
 * referrer) shared by `track()` and `trackPageview()`. No-ops outside a
 * browser context.
 */
const applyBrowserPayloadFields = (payload: UmamiSendPayloadPayload): void => {
  if (!isBrowser()) {
    return
  }

  payload.hostname = location.hostname
  payload.language = navigator.language
  payload.screen = `${screen.width}x${screen.height}`
  payload.title = document.title

  if (document.referrer) {
    payload.referrer = document.referrer
  }
}

/**
 * Directly-importable, isomorphic replacement for Umami's script-injected
 * `track()` global. Builds a payload from browser globals (when available)
 * plus the caller-supplied event name/data and fires it via
 * `sendUmamiPayload`, without awaiting or surfacing its result. Honors (in
 * the browser) the `window.__UMAMI_SUPPRESSED__` flag set for authenticated
 * Payload sessions, no-oping when tracking is suppressed.
 */
export const track: TrackFunction = (
  eventNameOrData?:
    | string
    | Record<string, unknown>
    | ((data: Record<string, unknown>) => Record<string, unknown>),
  data?: Record<string, unknown>,
): void => {
  if (shouldSuppressTracking(isBrowser() ? location.pathname : undefined)) {
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
  }
  applyBrowserPayloadFields(payload)

  const sendPayload: UmamiSendPayload = {
    type: 'event',
    payload,
  }

  void sendUmamiPayload(sendPayload)
}

/**
 * Fires a plain Umami pageview, similar to `track()` called bare, but lets
 * the caller supply the destination `url` explicitly. This matters for
 * client-side route transitions: `onRouterTransitionStart` fires BEFORE
 * `location` updates to the destination, so deriving the URL from
 * `location.pathname + location.search` (as bare `track()` does) would
 * record the page being left, not the page being navigated to. Called with
 * no `url` argument (e.g. for the very first page load, before any
 * navigation has started), it falls back to the current
 * `location.pathname + location.search`, matching bare `track()`'s prior
 * pageview behavior.
 */
export const trackPageview = (url?: string): void => {
  if (shouldSuppressTracking(url)) {
    return
  }

  const payload: UmamiSendPayloadPayload = {
    website: process.env.NEXT_PUBLIC_UMAMI_SITE_ID ?? '',
  }

  if (url !== undefined) {
    payload.url = url
  } else if (isBrowser()) {
    payload.url = location.pathname + location.search
  }
  applyBrowserPayloadFields(payload)

  const sendPayload: UmamiSendPayload = {
    type: 'event',
    payload,
  }

  void sendUmamiPayload(sendPayload)
}
