import type { WidgetServerProps } from 'payload'

import { Interval } from '@repo/utils/date'
import { isValid, parseISO } from 'date-fns'

import { UmamiWidgetClient } from './UmamiWidget.client'
import { fetchWebsite } from './UmamiWidget.data'

export const UmamiWidget = async (_props: WidgetServerProps) => {
  const website = await fetchWebsite()
  const { createdAt, deletedAt, resetAt, domain, id, teamId, name } = website || {}

  const minDate =
    resetAt && isValid(parseISO(resetAt))
      ? parseISO(resetAt)
      : createdAt && isValid(parseISO(createdAt))
        ? parseISO(createdAt)
        : new Date()

  const maxDate = deletedAt && isValid(parseISO(deletedAt)) ? parseISO(deletedAt) : new Date()

  const [startDate, endDate] = new Interval().setToLastSevenDays().value

  return (
    <UmamiWidgetClient
      startDate={startDate.toISOString()}
      endDate={endDate.toISOString()}
      minDate={minDate.toISOString()}
      maxDate={maxDate.toISOString()}
      domain={domain}
      name={name}
      id={id}
      teamId={teamId}
    />
  )
}
