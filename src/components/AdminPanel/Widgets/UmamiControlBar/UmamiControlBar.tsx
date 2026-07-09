import type { WidgetServerProps } from 'payload'

import { get } from 'lodash-es'

import { UmamiControlBarClient } from './UmamiControlBar.client'

export const UmamiControlBar = async ({ req }: WidgetServerProps) => {
  const preferencesUrl = new URL(
    '/api/payload-preferences/umami-charts:time-range',
    process.env.SERVER_URL,
  )
  const data = await fetch(preferencesUrl, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const preferences = await data.json()

  const startDate: string | null = get(preferences, 'value.startDate', null)
  const endDate: string | null = get(preferences, 'value.endDate', null)

  return <UmamiControlBarClient startDate={startDate} endDate={endDate} />
}
