'use client'

import { useEffect } from 'react'

import { UmamiEvent } from '@/lib/umami/events'
import { track } from '@/lib/umami/track'

/**
 * The pageview of a missing page carries the requested path like any other,
 * so this event is what tells broken links apart, with where they came from.
 */
export const TrackNotFound = () => {
  useEffect(() => {
    track(UmamiEvent.NotFound, {
      path: location.pathname,
      ...(document.referrer && { referrer: document.referrer }),
    })
  }, [])

  return null
}
