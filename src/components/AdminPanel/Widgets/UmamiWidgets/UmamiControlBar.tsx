'use client'

import { useUmamiCharts } from '@/contexts/UmamiCharts'
import { CalendarDatePicker } from '@/components/CalendarDatePicker'
import { useEffect, useMemo } from 'react'
import { Matcher } from 'react-day-picker'
import { Skeleton } from '@/components/ui/skeleton'

export const UmamiControlBar = () => {
  const {
    selectedTimeSpan,
    website,
    setSelectedTimeSpan,
    registerControlBar,
  } = useUmamiCharts()
  const { createdAt, deletedAt, resetAt, name, domain } = website || {}

  useEffect(registerControlBar, [])

  const matcher: Matcher[] = useMemo(() => {
    const beforeDate = resetAt ? new Date(resetAt) : createdAt ? new Date(createdAt) : undefined
    const afterDate = deletedAt ? new Date(deletedAt) : undefined

    return [
      { before: beforeDate },
      { after: afterDate },
    ]
  }, [createdAt, deletedAt, resetAt])

  return (
    <div className="w-full flex flex-row justify-between py-4">
      {!website ? (<Skeleton className='h-12 w-full"' />) : (
        <>
          <div className="text-xl md:text-2xl lg:text-3xl font-mono">Umami Controls</div>
          <CalendarDatePicker
            variant="secondary"
            date={{ from: new Date(selectedTimeSpan.startAt), to: new Date(selectedTimeSpan.endAt) }}
            onDateSelect={({ from, to }) => setSelectedTimeSpan(from, to)}
            disabled={matcher}
          />
        </>
      )}
    </div>
  )
}
