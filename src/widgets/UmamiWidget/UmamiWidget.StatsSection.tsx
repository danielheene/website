'use client'

import { useMemo } from 'react'

import { cn } from 'tailwind-variants'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/AdminPanel/Card'
import { Icon, type IconName } from '@/components/Icon'
import { Skeleton } from '@/components/Skeleton'
import { formatSecondsToDuration } from '@/lib/formatSecondsToDuration'

import type { UmamiStats } from './UmamiWidget.data'

const CONFIG = {
  visitors: {
    title: 'Visitors',
    order: 0,
    transform: (data) => data?.visitors,
    format: (v) => `${v}`,
    icon: 'material-symbols:group',
    // A rise in visitors is the desired direction.
    higherIsBetter: true,
  },
  visits: {
    title: 'Visits',
    order: 1,
    transform: (data) => data?.visits,
    format: (v) => `${v}`,
    icon: 'material-symbols:multimodal-hand-eye',
    higherIsBetter: true,
  },
  pageviews: {
    title: 'Views',
    order: 2,
    transform: (data) => data?.pageviews,
    format: (v) => `${v}`,
    icon: 'material-symbols:web-traffic',
    higherIsBetter: true,
  },
  bounces: {
    title: 'Bounce Rate',
    order: 3,
    transform: (data) => Math.round(data?.bounces || 0),
    format: (v) => `${v}%`,
    icon: 'material-symbols:undo',
    // A rise in bounce rate is worse, not better — the one inverted metric.
    higherIsBetter: false,
  },
  totaltime: {
    title: 'Visit Duration',
    order: 4,
    transform: (data) =>
      data?.totaltime > 0 && data?.visits > 0 ? data?.totaltime / data?.visits : 0,
    format: (v) => `${formatSecondsToDuration(v)}`,
    icon: 'material-symbols:nest-clock-farsight-analog-outline',
    higherIsBetter: true,
  },
} as Record<
  Exclude<keyof UmamiStats, 'comparison'>,
  {
    title: string
    order: number
    transform: (data: Record<Exclude<keyof UmamiStats, 'comparison'>, number>) => number
    format: (v: number) => string
    icon: string
    higherIsBetter: boolean
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
        const { title, transform, format, icon, higherIsBetter } = CONFIG[k]

        const rawValue = dataIsReady ? transform(data) : undefined
        const rawPrevValue = dataIsReady ? transform(data.comparison) : undefined

        return {
          title,
          icon,
          value: rawValue !== undefined ? format(rawValue) : undefined,
          change: computeChange(rawValue, rawPrevValue, higherIsBetter),
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

type ChangeDirection = 'up' | 'down' | 'flat'

interface Change {
  /** Signed percentage vs. the comparison period, e.g. `12.4` or `-3.1`. `null` when the comparison period had no data to compare against (a 0 → n change is undefined as a percentage). */
  percent: number | null
  direction: ChangeDirection
  /** Whether `direction` is the desirable one for this metric — bounce rate inverts this. */
  isGood: boolean
}

/**
 * Percentage change vs. the comparison period, direction-aware per metric
 * (a rising bounce rate is bad, a rising visitor count is good) — mirrors the
 * delta chip on Umami's own dashboard stat cards.
 */
function computeChange(
  current: number | undefined,
  previous: number | undefined,
  higherIsBetter: boolean,
): Change | undefined {
  if (current === undefined || previous === undefined) return undefined

  if (previous === 0) {
    // No baseline to divide by — show flat/no-data rather than a fabricated
    // infinite or 100% jump.
    return {
      percent: null,
      direction: current === 0 ? 'flat' : 'up',
      isGood: current === 0 ? true : higherIsBetter,
    }
  }

  const percent = ((current - previous) / previous) * 100
  const direction: ChangeDirection = percent > 0 ? 'up' : percent < 0 ? 'down' : 'flat'
  const isGood = direction === 'flat' || (direction === 'up') === higherIsBetter

  return {
    percent,
    direction,
    isGood,
  }
}

interface StatCardProps {
  title: string
  value?: string
  change?: Change
  icon: IconName
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <Card className="overflow-hidden col-span-1 md:col-span-1 lg:col-span-1 h-40">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <Icon name={icon} className="text-2xl text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {value && change ? (
          <>
            <div className="h-10 flex items-center text-4xl font-mono font-bold">{value}</div>
            <ChangeBadge change={change} />
          </>
        ) : (
          <Skeleton className="h-15" />
        )}
      </CardContent>
    </Card>
  )
}

const CHANGE_ICON: Record<ChangeDirection, IconName> = {
  up: 'trending-up',
  down: 'trending-down',
  flat: 'trending-flat',
}

function ChangeBadge({ change }: { change: Change }) {
  const { percent, direction, isGood } = change

  return (
    <div
      className={cn([
        'h-5 flex items-center gap-1 text-sm font-mono',
        isGood
          ? 'text-emerald-500'
          : direction === 'flat'
            ? 'text-muted-foreground'
            : 'text-destructive',
      ])}
      title="vs. previous period"
    >
      <Icon name={CHANGE_ICON[direction]} className="text-base" aria-hidden="true" />
      <span>{percent === null ? '—' : `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`}</span>
    </div>
  )
}
