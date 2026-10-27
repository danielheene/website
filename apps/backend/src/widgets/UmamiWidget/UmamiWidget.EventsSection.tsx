'use client'

import { MetricsTable } from '@website/app-components/MetricsTable/index'
import { cn } from 'tailwind-variants'

import {
  Card,
  CardContent,
  CardHeader,
  CardPagination,
  CardTitle,
} from '@/components/AdminPanel/Card'
import { useArrayPagination } from '@/lib/hooks/useArrayPagination'

import { LIST_PAGE_SIZE, SECTION_CONTENT_HEIGHT_CLASS } from './UmamiWidget.constants'
import type { UmamiEvent } from './UmamiWidget.data'
import { GhostRows } from './UmamiWidget.GhostRows'

interface EventsSectionProps {
  data: UmamiEvent[] | null
  dataIsLoading: boolean
  className?: string
}

export const EventsSection = ({ data, dataIsLoading, className }: EventsSectionProps) => {
  const { content, ...pagination } = useArrayPagination(data || [], LIST_PAGE_SIZE)
  const maxMetricValue = Math.max(...((data || []).map(({ y }) => y) || []), 0)
  const contentClass = SECTION_CONTENT_HEIGHT_CLASS

  return (
    <Card className={cn([className])}>
      <CardHeader>
        <CardTitle>Events</CardTitle>
        {!dataIsLoading && <CardPagination {...pagination} />}
      </CardHeader>
      <CardContent>
        {!content || dataIsLoading ? (
          <GhostRows rows={LIST_PAGE_SIZE} className={contentClass} />
        ) : (
          <MetricsTable data={content} maxValue={maxMetricValue} className={contentClass} />
        )}
      </CardContent>
    </Card>
  )
}
