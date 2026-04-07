'use client'

import { useEffect, useMemo } from 'react'

import { ICON, Icon, type IconName } from '@/components/Icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUmamiCharts } from '@/contexts/UmamiCharts'
import { formatSecondsToDuration } from '@/lib/formatSecondsToDuration'
import type { UmamiStats } from '@/lib/UmamiHandler'

const CONFIG = {
  visitors: {
    title: 'Visitors',
    order: 0,
    transform: (data) => data['visitors'],
    format: (v) => `${v}`,
    icon: ICON.GROUP,
  },
  visits: {
    title: 'Visits',
    order: 1,
    transform: (data) => data['visits'],
    format: (v) => `${v}`,
    icon: ICON.HAND_EYE,
  },
  pageviews: {
    title: 'Views',
    order: 2,
    transform: (data) => data['pageviews'],
    format: (v) => `${v}`,
    icon: ICON.WEB_TRAFFIC,
  },
  bounces: {
    title: 'Bounce Rate',
    order: 3,
    transform: (data) => Math.round(data['bounces']),
    format: (v) => `${v}%`,
    icon: ICON.UNDO,
  },
  totaltime: {
    title: 'Visit Duration',
    order: 4,
    transform: (data) => (data['totaltime'] > 0 && data['visits'] > 0 ? data['totaltime'] / data['visits'] : 0),
    format: (v) => `${formatSecondsToDuration(v)}`,
    icon: ICON.CLOCK,
  },
} as Record<
  Exclude<keyof UmamiStats, 'comparison'>,
  {
    title: string
    order: number
    transform: (data: Record<Exclude<keyof UmamiStats, 'comparison'>, number>) => number
    format: (v: number) => string
    icon: IconName
  }
>

export const UmamiStatsWidget = () => {
  const {
    stats: { data, dataIsLoading },
    registerWidget,
  } = useUmamiCharts()

  useEffect(() => {
    const unregister = registerWidget('stats')
    return () => unregister()
  }, [registerWidget])

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
  }, [data, dataIsLoading])

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
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
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Icon icon={icon} className="text-2xl text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {value && prevValue ? (
          <>
            <div className="h-10 flex items-center text-4xl font-mono font-bold">{value}</div>
            <div className="h-5 flex items-center text-md font-mono text-muted-foreground">{prevValue}</div>
          </>
        ) : (
          <Skeleton className="h-15" />
        )}
      </CardContent>
    </Card>
  )
}
