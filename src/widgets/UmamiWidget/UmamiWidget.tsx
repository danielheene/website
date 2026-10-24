import type { WidgetServerProps } from 'payload'

import { isAfter, isBefore, isValid, parseISO } from 'date-fns'

import { Interval } from '@/lib/date'

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

  const lastSevenDays = new Interval().setToLastSevenDays().value
  const startDate = isAfter(lastSevenDays[0], minDate) ? lastSevenDays[0] : minDate
  const endDate = isBefore(lastSevenDays[1], maxDate) ? lastSevenDays[1] : maxDate

  return (
    <UmamiWidgetClient
      startDate={isAfter(startDate, minDate) ? startDate.toISOString() : undefined}
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
