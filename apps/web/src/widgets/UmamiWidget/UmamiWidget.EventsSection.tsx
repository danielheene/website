'use client'

import { MetricsTable } from '@repo/ui/MetricsTable'
import { Skeleton } from '@repo/ui/Skeleton'
import { cn } from 'tailwind-variants'

import {
  Card,
  CardContent,
  CardHeader,
  CardPagination,
  CardTitle,
} from '@/components/AdminPanel/Card'
import { useArrayPagination } from '@/hooks/use-array-pagination'

import type { UmamiEvent } from './UmamiWidget.data'

interface EventsSectionProps {
  data: UmamiEvent[] | null
  dataIsLoading: boolean
  className?: string
}

export const EventsSection = ({ data, dataIsLoading, className }: EventsSectionProps) => {
  const { content, ...pagination } = useArrayPagination(data || [], 10)
  const maxMetricValue = Math.max(...((data || []).map(({ y }) => y) || []), 0)
  const contentClass = 'h-[410px]'

  return (
    <Card
      className={cn([
        className,
      ])}
    >
      <CardHeader>
        <CardTitle>Events</CardTitle>
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
