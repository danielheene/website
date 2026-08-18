'use server'

import { isTrackingSuppressed } from './isTrackingSuppressed.server'
import { sendUmamiPayload } from './sendUmamiPayload'
import type { UmamiSendPayload, UmamiSendPayloadPayload } from './Umami.types'

export interface TrackServerEventInput {
  name: string
  data?: Record<string, unknown>
  url?: string
  referrer?: string
  hostname?: string
}

const isDoNotTrackEnabled = () => process.env.NEXT_PUBLIC_UMAMI_DO_NOT_TRACK === 'true'

/**
 * Server-callable equivalent of `track()` for use in Route Handlers, Server
 * Actions, and RSC data fetchers, where there's no `window`/`document`/
 * `location` to infer context from. Callers must pass `url`/`referrer`/
 * `hostname` explicitly if they want them included. Builds a payload and
 * fires it via `sendUmamiPayload`, without awaiting or surfacing its result.
 * Honors `NEXT_PUBLIC_UMAMI_DO_NOT_TRACK`, no-oping when tracking is
 * suppressed, and suppresses tracking for the site owner's own
 * authenticated Payload sessions unless they've opted back in.
 */
export const trackServerEvent = async ({
  name,
  data,
  url,
  referrer,
  hostname,
}: TrackServerEventInput): Promise<void> => {
  if (isDoNotTrackEnabled()) {
    return
  }

  if (await isTrackingSuppressed()) {
    return
  }

  const payload: UmamiSendPayloadPayload = {
    website: process.env.NEXT_PUBLIC_UMAMI_SITE_ID ?? '',
    name,
    ...(data
      ? {
          data,
        }
      : {}),
    ...(url
      ? {
          url,
        }
      : {}),
    ...(referrer
      ? {
          referrer,
        }
      : {}),
    ...(hostname
      ? {
          hostname,
        }
      : {}),
  }

  const sendPayload: UmamiSendPayload = {
    type: 'event',
    payload,
  }

  try {
    void sendUmamiPayload(sendPayload)
  } catch {
    // sendUmamiPayload never throws in practice; this guards defensively.
  }
}
