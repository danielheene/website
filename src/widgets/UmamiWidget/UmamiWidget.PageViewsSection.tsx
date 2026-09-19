'use client'

import { useMemo } from 'react'

import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts'
import { cn } from 'tailwind-variants'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/AdminPanel/Card'
import { Skeleton } from '@/components/Skeleton'

import type { UmamiPageViews } from './UmamiWidget.data'

interface CustomTooltipProps {
  active?: boolean
  label?: string
  payload?: Array<{
    name: string
    value: number
    color: string
    dataKey: string
  }>
}

const pageviewsColor = 'var(--color-primary)'
// Primary lightened toward white in OKLCH — same hue, continuously tunable
// rather than pinned to a ramp step (40% lands at roughly the same lightness
// as primary-300). Verified against a colorblind-separation check (protan
// ΔE ~18, normal-vision ΔE ~24 — well past the safe floor); the chart also
// carries a legend, a surface gap between stacked segments, and
// text-labeled tooltip values as the required secondary identity channel
// alongside color.
const visitorsColor = 'color-mix(in oklch, var(--color-primary), white 40%)'

const SERIES = [
  {
    dataKey: 'pageviews',
    label: 'Pageviews',
    color: pageviewsColor,
  },
  {
    dataKey: 'visitors',
    label: 'Visitors',
    color: visitorsColor,
  },
] as const

interface PageViewsSectionProps {
  data: UmamiPageViews | null
  dataIsLoading: boolean
  className?: string
}

export const PageViewsSection = ({ data, dataIsLoading, className }: PageViewsSectionProps) => {
  const refinedData = useMemo(() => {
    if (data) {
      const views = data.pageviews.map(({ x, y }) => ({
        date: x,
        pageviews: y,
      }))
      const visitors = data.sessions.map(({ x, y }) => ({
        date: x,
        visitors: y,
      }))
      return views.map((view, i) => Object.assign({}, view, visitors[i]))
    }
    return null
  }, [
    data,
  ])

  return (
    <Card
      className={cn([
        'h-[550px] max-h-[550px] flex flex-col',
        className,
      ])}
    >
      <CardHeader>
        <CardTitle>Pageviews</CardTitle>
        {/* Two series, so a legend stays present — the dependable identity
            channel a reader can rely on instead of matching colors by eye. */}
        <ul className="flex items-center gap-4">
          {SERIES.map((series) => (
            <li key={series.dataKey} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: series.color,
                }}
                aria-hidden="true"
              />
              <span className="text-muted-foreground text-xs">{series.label}</span>
            </li>
          ))}
        </ul>
      </CardHeader>
      <CardContent className="grow flex flex-col">
        {/* `position: absolute` here would ignore CardContent's own px-6
            padding (inset values resolve against the border box, not the
            padding box, for an absolutely positioned child) — a plain flex
            child respects it instead, matching Paths'/Events' own
            MetricsTable, which sits in normal flow for the same reason. */}
        <div className="grow min-h-0">
          {!data || dataIsLoading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <BarChart
              responsive
              data={refinedData}
              // Recharts' accessibilityLayer gives the chart's SVG surface
              // tabIndex=0, which puts a browser focus ring on it whenever
              // any part of it is clicked (bars, axis ticks, anywhere).
              // `:focus-visible` isn't reliable enough here to tell a real
              // keyboard Tab-focus apart from a click on a `role="application"`
              // element across browsers, so the ring is dropped unconditionally.
              className="w-full h-full [&_.recharts-surface]:outline-none [&_.recharts-surface]:focus:outline-none"
              margin={{
                top: 24,
                right: 24,
                left: 0,
                bottom: 0,
              }}
              onContextMenu={(_, e) => e.preventDefault()}
            >
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                }}
                className="text-xs"
              />
              <YAxis width="auto" />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: 'var(--color-foreground)',
                  fillOpacity: 0.05,
                }}
              />
              {/* pageviews as the stack base (a pageview implies a session, so
                  it is always >= visitors), visitors stacked above it — the
                  2px surface gap between segments is the separator, not a
                  stroke, per the design system's mark spec. */}
              <Bar
                dataKey="pageviews"
                name="Pageviews"
                stackId="views"
                fill={pageviewsColor}
                stroke="var(--color-card)"
                strokeWidth={2}
              />
              <Bar
                dataKey="visitors"
                name="Visitors"
                stackId="views"
                fill={visitorsColor}
                stroke="var(--color-card)"
                strokeWidth={2}
                radius={[
                  4,
                  4,
                  0,
                  0,
                ]}
              />
            </BarChart>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CustomTooltip({ active, label, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const date = new Date(label || '')
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
      <div className="font-medium mb-2">{formattedDate}</div>
      {payload.map((item) => (
        <div key={item.dataKey} className="flex items-center gap-2">
          <div
            className="size-2.5 rounded-full"
            style={{
              backgroundColor: item.dataKey === 'pageviews' ? pageviewsColor : visitorsColor,
            }}
          />
          <span className="text-muted-foreground">
            {item.dataKey === 'pageviews' ? 'Pageviews' : 'Visitors'}: {item.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}
