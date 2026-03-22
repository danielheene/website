'use client'

import { CardHeader, CardTitle, CardContent, Card, CardHeaderPagination } from '@/components/ui/card'
import { useUmamiCharts } from '@/contexts/UmamiCharts'
import { useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { MetricsTable } from '@/components/MetricsTable'
import { useArrayPagination } from '@/hooks/use-array-pagination'

export const UmamiEventsWidget = () => {
  const {
    events: { data, dataIsLoading },
    registerWidget,
  } = useUmamiCharts()

  useEffect(() => {
    const unregister = registerWidget('events')
    return () => unregister()
  }, [])

  const { hasPrevPage, hasNextPage, content, setPrevPage, setNextPage } = useArrayPagination(data || [], 10)
  const maxMetricValue = Math.max(...(data?.map(({ y }) => y) || []), 0)
  const contentClass = 'h-[410px]'

  return (
    <Card className="col-span-full lg:col-span-2 h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Events</CardTitle>
        <CardHeaderPagination
          hasPrevPage={hasPrevPage}
          hasNextPage={hasNextPage}
          setPrevPage={setPrevPage}
          setNextPage={setNextPage}
        />
      </CardHeader>
      <CardContent className="flex flex-col justify-start">
        {!data || dataIsLoading ? <Skeleton className={contentClass} /> :
          <MetricsTable data={content} maxValue={maxMetricValue} className={contentClass} />}
      </CardContent>
    </Card>
  )
}
