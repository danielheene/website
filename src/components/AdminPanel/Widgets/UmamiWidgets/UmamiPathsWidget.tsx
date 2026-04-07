'use client'

import { useEffect } from 'react'

import { MetricsTable } from '@/components/MetricsTable'
import { Card, CardContent, CardHeader, CardHeaderPagination, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUmamiCharts } from '@/contexts/UmamiCharts'
import { useArrayPagination } from '@/hooks/use-array-pagination'

export const UmamiPathsWidget = () => {
  const {
    paths: { data, dataIsLoading },
    registerWidget,
  } = useUmamiCharts()

  useEffect(() => {
    const unregister = registerWidget('paths')
    return () => unregister()
  }, [registerWidget])

  const { hasPrevPage, hasNextPage, content, setPrevPage, setNextPage } = useArrayPagination(data || [], 10)
  const maxMetricValue = Math.max(...(data?.map(({ y }) => y) || []), 0)
  const contentClass = 'h-[410px]'

  return (
    <Card className="col-span-full lg:col-span-2 h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Paths</CardTitle>
        <CardHeaderPagination hasPrevPage={hasPrevPage} hasNextPage={hasNextPage} setPrevPage={setPrevPage} setNextPage={setNextPage} />
      </CardHeader>
      <CardContent className="flex flex-col">
        {!data || dataIsLoading ? (
          <Skeleton className={contentClass} />
        ) : (
          <MetricsTable data={content} maxValue={maxMetricValue} className={contentClass} />
        )}
      </CardContent>
    </Card>
  )
}
