import { useEffect, useState } from 'react'

import type { Interval } from '@repo/utils/date'

interface UseSectionDataResult<T> {
  data: T | null
  isLoading: boolean
}

/**
 * Fetches a single widget section's data whenever `selectedInterval`
 * changes, tracking its own `data`/`isLoading` state so each section
 * (stats/events/paths/pageViews) can be wired up with one call instead of a
 * duplicated fetch effect.
 *
 * Guards against stale responses: if `selectedInterval` changes again before
 * a previous `fetchFn` call resolves, that call's result is ignored instead
 * of overwriting newer data.
 */
export function useSectionData<T>(
  selectedInterval: Interval | null,
  fetchFn: (interval: Interval) => Promise<T | null>,
): UseSectionDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!selectedInterval) return

    let isCancelled = false

    setIsLoading(true)
    fetchFn(selectedInterval)
      .then((result) => {
        if (!isCancelled) setData(result)
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [
    selectedInterval,
    fetchFn,
  ])

  return {
    data,
    isLoading,
  }
}
