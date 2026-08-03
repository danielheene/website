'use client'

import { useMemo, useRef } from 'react'

import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { cn } from 'tailwind-variants'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/AdminPanel/Card'
import { Skeleton } from '@repo/ui/Skeleton'

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

const primaryColor = '#1D27F2FF'
const secondaryColor = '#1DF2C4FF'

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

  const cardContentRef = useRef<HTMLDivElement>(null)

  return (
    <Card
      className={cn([
        'h-[550px] max-h-[550px] flex flex-col',
        className,
      ])}
    >
      <CardHeader>
        <CardTitle>Pageviews</CardTitle>
      </CardHeader>
      <CardContent ref={cardContentRef} className="grow relative">
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            height: cardContentRef.current?.getBoundingClientRect().height,
            width: cardContentRef.current?.getBoundingClientRect().width,
          }}
        >
          {!data || dataIsLoading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <AreaChart
              responsive
              data={refinedData}
              className="w-full h-full"
              margin={{
                top: 24,
                right: 24,
                left: 0,
                bottom: 0,
              }}
              onContextMenu={(_, e) => e.preventDefault()}
            >
              <defs>
                <linearGradient id="pageviewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30 text-[10px]" />
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
                  stroke: primaryColor,
                  strokeOpacity: 0.2,
                }}
              />
              <Area
                type="monotone"
                dataKey="pageviews"
                stroke={primaryColor}
                fillOpacity={1}
                fill="url(#pageviewsGradient)"
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke={secondaryColor}
                fillOpacity={1}
                fill="url(#visitorsGradient)"
              />
            </AreaChart>
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
              backgroundColor: item.dataKey === 'pageviews' ? primaryColor : secondaryColor,
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
