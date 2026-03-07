'use client'

import { CardHeader, CardTitle, CardDescription, CardContent, Card } from '@/components/ui/card'
import { useUmamiCharts } from '@/contexts/UmamiCharts'
import { useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { MetricsTable } from '@/components/MetricsTable'

export const UmamiPathsWidget = () => {
  const {
    paths: { data, dataIsLoading },
    registerWidget,
  } = useUmamiCharts()

  useEffect(() => {
    const unregister = registerWidget('paths')
    return () => unregister()
  }, [])

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Pages</CardTitle>
        {/*<CardDescription>Pageviews and unique visitors over the last 30 days</CardDescription>*/}
      </CardHeader>
      <CardContent className="flex flex-col">
        {!data || dataIsLoading ? <Skeleton className="h-40" /> :
          <MetricsTable data={data} metricName="Pages" valueName="Visitors" />}
      </CardContent>
    </Card>
  )
}
