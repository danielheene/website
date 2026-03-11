'use client'

import { useUmamiCharts } from '@/contexts/UmamiCharts'
import { CalendarDatePicker } from '@/components/CalendarDatePicker'
import { useEffect, useMemo } from 'react'
import { Matcher } from 'react-day-picker'
import { Skeleton } from '@/components/ui/skeleton'

export const UmamiControlBar = () => {
  const { selectedTimeSpan, website, setSelectedTimeSpan, registerControlBar } = useUmamiCharts()

  useEffect(registerControlBar, [])

  const matcher: Matcher[] | undefined = useMemo(() => {
    const matchers = []
    if (website && website.createdAt) {
      matchers.push({
        before: new Date(website.createdAt),
      })
    }
    if (website && website.deletedAt) {
      matchers.push({
        after: new Date(website.deletedAt),
      })
    }
    return matchers.length > 0 ? matchers : undefined
  }, [website])

  return (
    <div className="w-full flex flex-row justify-between py-4">
      {!website ? (<Skeleton className='h-12 w-60"' />) : (
        <div className="text-xl md:text-2xl lg:text-3xl font-mono">Umami Controls</div>)}
      {!website ? (<Skeleton className='h-12 w-60"' />) : (
        <CalendarDatePicker variant="secondary"
                            date={{ from: new Date(selectedTimeSpan.startAt), to: new Date(selectedTimeSpan.endAt) }}
                            onDateSelect={({ from, to }) => setSelectedTimeSpan(from, to)}
                            disabled={matcher}
        />
      )}
    </div>
  )
}
