'use server'

import * as Umami from '@umami/api-client'
import { clamp, getTime, subWeeks } from 'date-fns'
import { minTime } from 'date-fns/constants'

interface FetchPathsArgs {
  startAt: string
  endAt: string
}

export async function fetchPaths({ startAt, endAt }: FetchPathsArgs) {
  const client = Umami.getClient()

  console.log('Fetching paths...', {
    type: 'path',
    startAt: getTime(startAt),
    endAt: getTime(endAt),
  })

  const { ok, data, status, error } = await client.getWebsiteMetrics('76a76305-c979-41ff-81a0-b5a9f39c8c75', {
    startAt: clamp(subWeeks(new Date(), 4), {
      start: new Date(minTime),
      end: new Date(),
    }).getTime(),
    endAt: Date.now(),
    type: 'path',
  })

  console.log({ ok, data, status, error })
  if (!ok) {
    console.error('Failed to fetch charts:', error)
    return
  }

  if (!data) {
    console.error('No data received from API')
    return
  }

  return data
}
