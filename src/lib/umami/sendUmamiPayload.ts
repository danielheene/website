import type { UmamiSendPayload } from './Umami.types'

// `navigator.sendBeacon` rejects payloads over ~64KB. Use a slightly
// conservative threshold to leave headroom for browser-specific overhead.
const UMAMI_BEACON_MAX_BYTES = 64_000

const isBrowser = () => typeof window !== 'undefined'

const getByteSize = (body: string): number => new TextEncoder().encode(body).length

const sendViaFetch = async (url: string, body: string, keepalive: boolean) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    ...(keepalive
      ? {
          keepalive: true,
        }
      : {}),
  })

  if (!response.ok) {
    console.debug(`sendUmamiPayload: request failed with status ${response.status}`)
  }
}

/**
 * Sends a pre-built payload to Umami's collect API. Works from both browser
 * and server code: in the browser it prefers `navigator.sendBeacon` when
 * available and the payload is within the beacon size limit, falling back
 * to `fetch` with `keepalive: true` otherwise (including when the payload
 * exceeds `UMAMI_BEACON_MAX_BYTES`); on the server it always uses `fetch`.
 * Never throws or rejects — failures are swallowed and logged via
 * `console.debug` so tracking issues never break the calling code.
 */
export const sendUmamiPayload = async (payload: UmamiSendPayload): Promise<void> => {
  // In the browser, route through the same-origin `/stats` rewrite (see
  // next.config.ts) so the request doesn't visibly hit the Umami domain,
  // which keeps it out of ad-blocker filter lists that target known
  // analytics hosts/paths. On the server there is no origin to resolve a
  // relative URL against and no rewrite applies to a raw server fetch, so
  // the absolute Umami URL is used instead.
  const url = isBrowser() ? '/stats/api/send' : `${process.env.NEXT_PUBLIC_UMAMI_URL}/api/send`
  const body = JSON.stringify(payload)

  try {
    if (
      isBrowser() &&
      typeof navigator !== 'undefined' &&
      navigator.sendBeacon &&
      getByteSize(body) <= UMAMI_BEACON_MAX_BYTES
    ) {
      const blob = new Blob(
        [
          body,
        ],
        {
          type: 'application/json',
        },
      )
      const sent = navigator.sendBeacon(url, blob)

      if (!sent) {
        console.debug('sendUmamiPayload: navigator.sendBeacon reported failure')
      }

      return
    }

    await sendViaFetch(url, body, isBrowser())
  } catch (error) {
    console.debug('sendUmamiPayload: failed to send payload', error)
  }
}
