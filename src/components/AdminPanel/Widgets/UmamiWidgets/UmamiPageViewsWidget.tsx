'use client'

import { useEffect, useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useUmamiCharts } from '@/contexts/UmamiCharts'
import { cn } from '@/utilities/cn'

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

export const UmamiPageViewsWidget = () => {
  const {
    pageViews: { data, dataIsLoading },
    registerWidget,
  } = useUmamiCharts()

  useEffect(() => {
    const unregister = registerWidget('pageViews')
    return () => unregister()
  }, [registerWidget])

  const chartConfig = {
    pageviews: {
      label: 'Pageviews',
      color: primaryColor,
    },
    visitors: {
      label: 'Visitors',
      color: secondaryColor,
    },
  }

  const refinedData = useMemo(() => {
    if (data) {
      const views = data.pageviews.map(({ x, y }) => ({ date: x, pageviews: y }))
      const visitors = data.sessions.map(({ x, y }) => ({ date: x, visitors: y }))
      return views.map((view, i) => Object.assign({}, view, visitors[i]))
    }
    return null
  }, [data])

  return (
    <Card className="col-span-full lg:col-span-2 h-full">
      <CardHeader>
        <CardTitle>Pageviews</CardTitle>
      </CardHeader>
      <CardContent>
        {!data || dataIsLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className={cn(['h-[400px] w-full'])}>
            <AreaChart data={refinedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pageviewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }}
                className="text-xs fill-muted-foreground"
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs fill-muted-foreground" />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: primaryColor, strokeOpacity: 0.2 }} />
              <Area type="monotone" dataKey="pageviews" stroke={primaryColor} strokeWidth={2} fill="url(#pageviewsGradient)" />
              <Area type="monotone" dataKey="visitors" stroke={secondaryColor} strokeWidth={2} fill="url(#visitorsGradient)" />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

function CustomTooltip({ active, label, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const date = new Date(label || '')
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
      <div className="font-medium mb-2">{formattedDate}</div>
      {payload.map((item) => (
        <div key={item.dataKey} className="flex items-center gap-2">
          <div
            className="size-2.5 rounded-full"
            style={{ backgroundColor: item.dataKey === 'pageviews' ? primaryColor : secondaryColor }}
          />
          <span className="text-muted-foreground">
            {item.dataKey === 'pageviews' ? 'Pageviews' : 'Visitors'}: {item.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}
