'use client'

import { fetchPaths } from '@/contexts/UmamiCharts/lib/fetchPaths'
import { UmamiChartsContext } from '@/contexts/UmamiCharts/UmamiCharts.context'
import { UmamiChartsInternalState } from '@/contexts/UmamiCharts/UmamiCharts.types'
import { subWeeks } from 'date-fns'
import { JSX, ReactNode, useCallback, useEffect, useState } from 'react'

interface UmamiChartsProviderProps {
  children: ReactNode
}

const initialState: UmamiChartsInternalState = {
  startAt: new Date().toJSON(),
  endAt: subWeeks(new Date(), 2).toJSON(),
}

export const UmamiChartsProvider = ({ children }: UmamiChartsProviderProps): JSX.Element => {
  const [{ startAt, endAt }, setState] = useState(initialState)

  const [paths, setPaths] = useState<Record<string, string>[]>([])

  const fetchDate = useCallback(() => {
    fetchPaths({ startAt, endAt }).then((data) => setPaths(data || []))
  }, [startAt, endAt])
  // useEffect(() => {
  //   getPaths.bind(null, { startDate: '2022-01-01', endDate: '2022-01-31' }).then((data) => setPaths(data || [])
  // }, [])

  useEffect(() => {
    fetchDate()
  }, [])

  console.log(paths)
  return <UmamiChartsContext value={{ paths }}>{children}</UmamiChartsContext>
}
