'use client'

import { useEffect } from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  CardPagination,
  CardTitle,
} from '@/components/AdminPanel/Card'
import { MetricsTable } from '@/components/MetricsTable'
import { Skeleton } from '@/components/Skeleton'
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
  }, [
    registerWidget,
  ])

  const { content, ...pagination } = useArrayPagination(data || [], 10)
  const maxMetricValue = Math.max(...(data?.map(({ y }) => y) || []), 0)
  const contentClass = 'h-[410px]'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paths</CardTitle>
        <CardPagination {...pagination} />
      </CardHeader>
      <CardContent>
        {!content || dataIsLoading ? (
          <Skeleton className={contentClass} />
        ) : (
          <MetricsTable data={content} maxValue={maxMetricValue} className={contentClass} />
        )}
      </CardContent>
    </Card>
  )
}
