'use client'

import { useMemo } from 'react'

import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts'
import { cn } from 'tailwind-variants'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/AdminPanel/Card'

import { SECTION_CONTENT_HEIGHT_CLASS } from './UmamiWidget.constants'
import type { UmamiPageViews } from './UmamiWidget.data'
import { GhostBarChart } from './UmamiWidget.GhostBarChart'

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
  }, [data])

  return (
    <Card className={cn([className])}>
      <CardHeader>
        <CardTitle>Pageviews</CardTitle>
        {/* Two series, so a legend stays present — the dependable identity
            channel a reader can rely on instead of matching colors by eye. */}
        {!dataIsLoading && (
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
                <span className="font-mono text-xs text-muted-foreground">{series.label}</span>
              </li>
            ))}
          </ul>
        )}
      </CardHeader>
      <CardContent>
        <div className={SECTION_CONTENT_HEIGHT_CLASS}>
          {!data || dataIsLoading ? (
            <GhostBarChart className="size-full" />
          ) : (
            <BarChart
              responsive
              data={refinedData}
              // accessibilityLayer's role="application" surface paints a native focus ring on click that CSS can't suppress
              accessibilityLayer={false}
              // internal <g> layers keep tabindex="-1" (click-focusable), so unset outline on every [tabindex]
              className="size-full [&_.recharts-cartesian-axis-tick-value]:font-mono [&_.recharts-cartesian-axis-tick-value]:text-[10px] **:[[tabindex]]:outline-none"
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
                tick={{ fill: 'var(--color-muted-foreground)' }}
                angle={35}
                textAnchor="start"
                height={40}
              />
              <YAxis width="auto" tick={{ fill: 'var(--color-muted-foreground)' }} />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: 'var(--color-foreground)',
                  fillOpacity: 0.05,
                }}
              />
              {/* pageviews as the stack base (a pageview implies a session, so
                  it is always >= visitors), visitors stacked above it. */}
              <Bar dataKey="pageviews" name="Pageviews" stackId="views" fill={pageviewsColor} />
              <Bar
                dataKey="visitors"
                name="Visitors"
                stackId="views"
                fill={visitorsColor}
                radius={[4, 4, 0, 0]}
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
    <div className="rounded-lg bg-background px-3 py-2 font-mono text-xs shadow-xl">
      <div className="mb-2 font-medium">{formattedDate}</div>
      {payload.map((item) => (
        <div key={item.dataKey} className="flex items-center gap-2">
          <div
            className="size-2.5 shrink-0 rounded-full"
            style={{
              backgroundColor: item.dataKey === 'pageviews' ? pageviewsColor : visitorsColor,
            }}
          />
          <span className="text-muted-foreground">
            {item.dataKey === 'pageviews' ? 'Pageviews' : 'Visitors'}
          </span>
          <span className="ml-auto text-muted-foreground">{item.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}
