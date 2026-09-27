'use client'

import { useCallback, useState } from 'react'
import { useAuth } from '@payloadcms/ui'

import { CollectionSlug } from '@/types/collections'

interface UseOwnTrackingOptions {
  userId: string
  initialValue: boolean
}

interface UseOwnTrackingResult {
  enabled: boolean
  isSaving: boolean
  toggle: () => void
}

export function useOwnTracking({
  userId,
  initialValue,
}: UseOwnTrackingOptions): UseOwnTrackingResult {
  const { refreshCookieAsync } = useAuth()
  const [enabled, setEnabled] = useState<boolean>(initialValue)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const toggle = useCallback(async () => {
    if (isSaving) return

    const next = !enabled
    const previous = enabled
    setEnabled(next)
    setIsSaving(true)

    try {
      const response = await fetch(`/api/${CollectionSlug.Users}/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enableOwnTracking: next,
        }),
      })

      if (!response.ok) throw new Error(`Failed to update tracking preference: ${response.status}`)

      await refreshCookieAsync()
    } catch (error) {
      console.error('Error updating own-tracking preference:', error)
      setEnabled(previous)
    } finally {
      setIsSaving(false)
    }
  }, [
    enabled,
    isSaving,
    refreshCookieAsync,
    userId,
  ])

  return {
    enabled,
    isSaving,
    toggle,
  }
}
