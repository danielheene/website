'use client'

import { useMemo } from 'react'

import { cn } from 'tailwind-variants'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/AdminPanel/Card'
import { Icon, type IconName } from '@repo/ui/Icon'
import { Skeleton } from '@repo/ui/Skeleton'
import { formatSecondsToDuration } from '@repo/utils/formatSecondsToDuration'

import type { UmamiStats } from './UmamiWidget.data'

const CONFIG = {
  visitors: {
    title: 'Visitors',
    order: 0,
    transform: (data) => data?.visitors,
    format: (v) => `${v}`,
    icon: 'material-symbols:group',
  },
  visits: {
    title: 'Visits',
    order: 1,
    transform: (data) => data?.visits,
    format: (v) => `${v}`,
    icon: 'material-symbols:multimodal-hand-eye',
  },
  pageviews: {
    title: 'Views',
    order: 2,
    transform: (data) => data?.pageviews,
    format: (v) => `${v}`,
    icon: 'material-symbols:web-traffic',
  },
  bounces: {
    title: 'Bounce Rate',
    order: 3,
    transform: (data) => Math.round(data?.bounces || 0),
    format: (v) => `${v}%`,
    icon: 'material-symbols:undo',
  },
  totaltime: {
    title: 'Visit Duration',
    order: 4,
    transform: (data) =>
      data?.totaltime > 0 && data?.visits > 0 ? data?.totaltime / data?.visits : 0,
    format: (v) => `${formatSecondsToDuration(v)}`,
    icon: 'material-symbols:nest-clock-farsight-analog-outline',
  },
} as Record<
  Exclude<keyof UmamiStats, 'comparison'>,
  {
    title: string
    order: number
    transform: (data: Record<Exclude<keyof UmamiStats, 'comparison'>, number>) => number
    format: (v: number) => string
    icon: string
  }
>

interface StatsSectionProps {
  data: UmamiStats | null
  dataIsLoading: boolean
  className?: string
}

export const StatsSection = ({ data, dataIsLoading, className }: StatsSectionProps) => {
  const stats = useMemo(() => {
    const dataIsReady = !dataIsLoading && data && typeof data === 'object'

    return Object.keys(CONFIG)
      .sort((a, b) => CONFIG[a]?.order - CONFIG[b]?.order)
      .map((k) => {
        const { title, transform, format, icon } = CONFIG[k]

        const value = dataIsReady ? format(transform(data)) : undefined
        const prevValue = dataIsReady ? format(transform(data.comparison)) : undefined

        return {
          title,
          icon,
          value,
          prevValue,
        }
      })
  }, [
    data,
    dataIsLoading,
  ])

  return (
    <div
      className={cn([
        'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5 h-40',
        className,
      ])}
    >
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}

interface StatCardProps {
  title: string
  value?: string
  prevValue?: string
  icon: IconName
}

function StatCard({ title, value, prevValue, icon }: StatCardProps) {
  return (
    <Card className="overflow-hidden col-span-1 md:col-span-1 lg:col-span-1 h-40">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <Icon name={icon} className="text-2xl text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {value && prevValue ? (
          <>
            <div className="h-10 flex items-center text-4xl font-mono font-bold">{value}</div>
            <div className="h-5 flex items-center text-md font-mono text-muted-foreground">
              {prevValue}
            </div>
          </>
        ) : (
          <Skeleton className="h-15" />
        )}
      </CardContent>
    </Card>
  )
}
