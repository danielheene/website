'use client'

import { cn } from 'tailwind-variants'

import {
  Card,
  CardContent,
  CardHeader,
  CardPagination,
  CardTitle,
} from '@/components/AdminPanel/Card'
import { MetricsTable } from '@/components/MetricsTable'
import { Skeleton } from '@/components/Skeleton'
import { useArrayPagination } from '@/lib/hooks/useArrayPagination'

import { LIST_PAGE_SIZE, SECTION_CONTENT_HEIGHT_CLASS } from './UmamiWidget.constants'
import type { UmamiPath } from './UmamiWidget.data'

interface PathsSectionProps {
  data: UmamiPath[] | null
  dataIsLoading: boolean
  className?: string
}

export const PathsSection = ({ data, dataIsLoading, className }: PathsSectionProps) => {
  const { content, ...pagination } = useArrayPagination(data || [], LIST_PAGE_SIZE)
  const maxMetricValue = Math.max(...(data?.map(({ y }) => y) || []), 0)
  const contentClass = SECTION_CONTENT_HEIGHT_CLASS

  return (
    <Card className={cn([className])}>
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
