'use client'

import { startTransition, useCallback, useMemo, useState } from 'react'
import { FullscreenModal, useModal } from '@payloadcms/ui'

import { Interval } from '@repo/utils/date'
import { parseISO } from 'date-fns'

import { DateRangeModal } from './UmamiWidget.DateRangeModal'
import type { UmamiEvent, UmamiPageViews, UmamiPath, UmamiStats } from './UmamiWidget.data'
import { fetchEvents, fetchPageViews, fetchPaths, fetchStats } from './UmamiWidget.data'
import { EventsSection } from './UmamiWidget.EventsSection'
import { Header } from './UmamiWidget.Header'
import { useSectionData } from './UmamiWidget.hooks'
import { PageViewsSection } from './UmamiWidget.PageViewsSection'
import { PathsSection } from './UmamiWidget.PathsSection'
import { StatsSection } from './UmamiWidget.StatsSection'

const modalSlug = 'umami-date-picker'

// Module-scope adapters so their references stay stable across renders and
// don't retrigger `useSectionData`'s effect unnecessarily. They keep the
// same plain-string params crossing to the underlying Server Actions as
// before, only extracting them from the `Interval` here on the client.
const fetchStatsForInterval = (interval: Interval): Promise<UmamiStats | null> =>
  fetchStats({
    startAt: interval.ISOStringStartDate,
    endAt: interval.ISOStringEndDate,
    unit: 'day',
  })

const fetchEventsForInterval = (interval: Interval): Promise<UmamiEvent[] | null> =>
  fetchEvents({
    startAt: interval.ISOStringStartDate,
    endAt: interval.ISOStringEndDate,
  })

const fetchPathsForInterval = (interval: Interval): Promise<UmamiPath[] | null> =>
  fetchPaths({
    startAt: interval.ISOStringStartDate,
    endAt: interval.ISOStringEndDate,
  })

const fetchPageViewsForInterval = (interval: Interval): Promise<UmamiPageViews | null> =>
  fetchPageViews({
    startAt: interval.ISOStringStartDate,
    endAt: interval.ISOStringEndDate,
    unit: 'day',
    timezone: 'Europe/Berlin',
  })

interface UmamiWidgetClientProps {
  startDate: string
  endDate: string
  minDate: string
  maxDate: string
  domain: string | null
  id: string | null
  name: string | null
  teamId: string | null
}

export const UmamiWidgetClient = ({
  startDate: startDateFromProps,
  endDate: endDateFromProps,
  minDate: minDateFromProps,
  maxDate: maxDateFromProps,
  domain,
  id,
  name,
  teamId,
}: UmamiWidgetClientProps) => {
  const [selectedInterval, setSelectedIntervalState] = useState<Interval | null>(null)

  const stats = useSectionData(selectedInterval, fetchStatsForInterval)
  const events = useSectionData(selectedInterval, fetchEventsForInterval)
  const paths = useSectionData(selectedInterval, fetchPathsForInterval)
  const pageViews = useSectionData(selectedInterval, fetchPageViewsForInterval)

  const setSelectedInterval = useCallback((startAt: Date, endAt: Date) => {
    setSelectedIntervalState(new Interval(startAt, endAt))
  }, [])

  const [tempStartDate, setTempStartDate] = useState<Date>(parseISO(startDateFromProps))
  const [tempEndDate, setTempEndDate] = useState<Date>(parseISO(endDateFromProps))
  const [startDate, endDate] = selectedInterval
    ? selectedInterval.value
    : [
        new Date(startDateFromProps),
        new Date(endDateFromProps),
      ]

  const minDate = parseISO(minDateFromProps)
  const maxDate = parseISO(maxDateFromProps)

  const umamiUrl = useMemo(() => {
    const umamiPath = `${teamId ? `/teams/${teamId}` : ''}/websites/${id}/`
    return new URL(umamiPath, process.env.NEXT_PUBLIC_UMAMI_URL).toString()
  }, [
    id,
    teamId,
  ])

  const { openModal, closeModal } = useModal()

  const handleModalOpen = useCallback(() => {
    openModal(modalSlug)
  }, [
    openModal,
  ])

  const handleConfirm = useCallback(() => {
    if (tempStartDate && tempEndDate) {
      setSelectedInterval(tempStartDate, tempEndDate)
    }
    closeModal(modalSlug)
  }, [
    closeModal,
    setSelectedInterval,
    tempEndDate,
    tempStartDate,
  ])

  const handleCancel = useCallback(() => {
    closeModal(modalSlug)
  }, [
    closeModal,
  ])

  const handleQuickSelect = useCallback(
    (interval: Interval) => {
      setSelectedInterval(...interval.value)
      closeModal(modalSlug)
    },
    [
      closeModal,
      setSelectedInterval,
    ],
  )

  const handleMoveInterval = useCallback(
    (direction: 1 | -1) => {
      const nextInterval = new Interval(startDate, endDate).moveInterval(direction)
      startTransition(() => {
        setSelectedInterval(...nextInterval.value)
      })
    },
    [
      startDate,
      endDate,
      setSelectedInterval,
    ],
  )

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 flex flex-row justify-between items-center py-4">
        <Header
          domain={domain}
          name={name}
          umamiUrl={umamiUrl}
          startDate={startDate}
          endDate={endDate}
          onOpenModal={handleModalOpen}
          onMoveInterval={handleMoveInterval}
        />
        <FullscreenModal slug={modalSlug} trapFocus={true} lockBodyScroll={true} closeOnBlur={true}>
          <DateRangeModal
            tempStartDate={tempStartDate}
            tempEndDate={tempEndDate}
            setTempStartDate={setTempStartDate}
            setTempEndDate={setTempEndDate}
            minDate={minDate}
            maxDate={maxDate}
            startDate={startDate}
            endDate={endDate}
            onQuickSelect={handleQuickSelect}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
          />
        </FullscreenModal>
      </div>

      <StatsSection data={stats.data} dataIsLoading={stats.isLoading} className="col-span-12" />
      <PageViewsSection
        data={pageViews.data}
        dataIsLoading={pageViews.isLoading}
        className="col-span-10 lg:col-span-6"
      />
      <PathsSection
        data={paths.data}
        dataIsLoading={paths.isLoading}
        className="col-span-12 lg:col-span-3"
      />
      <EventsSection
        data={events.data}
        dataIsLoading={events.isLoading}
        className="col-span-12 lg:col-span-3"
      />
    </div>
  )
}
