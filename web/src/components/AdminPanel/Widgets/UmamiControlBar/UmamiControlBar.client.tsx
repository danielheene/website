'use client'

import { Button, DatePicker, FullscreenModal, Modal, useModal } from '@payloadcms/ui'
import { formatDate, isAfter, isBefore, isValid, parseISO } from 'date-fns'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Skeleton } from '@/components/Skeleton'
import { useUmamiCharts } from '@/contexts/UmamiCharts'
import { cn } from '@/lib/cn'

const modalSlug = 'umami-date-picker'

interface UmamiControlBarClientProps {
  startDate: string | null
  endDate: string | null
}

export const UmamiControlBarClient = ({
  startDate: startDateFromPropsString,
  endDate: endDateFromPropsString,
}: UmamiControlBarClientProps) => {
  const { selectedTimeSpan, website, setSelectedTimeSpan, registerControlBar } = useUmamiCharts()
  const {
    createdAt: createdAtString,
    deletedAt: deletedAtString,
    resetAt: resetAtString,
    name,
    domain,
    teamId,
    id,
  } = website || {}

  useEffect(
    () => registerControlBar(),
    [
      registerControlBar,
    ],
  )

  const prevStartDate = useRef<Date | null>(null)
  const [startDate, setStartDate] = useState<Date>((): Date => {
    const startDateFromProps: Date | null =
      startDateFromPropsString && isValid(parseISO(startDateFromPropsString))
        ? parseISO(startDateFromPropsString)
        : null
    const createdAt: Date | null =
      createdAtString && isValid(parseISO(createdAtString)) ? parseISO(createdAtString) : null
    const resetAt: Date | null =
      resetAtString && isValid(parseISO(resetAtString)) ? parseISO(resetAtString) : null

    return startDateFromProps && isAfter(startDateFromProps, resetAt || createdAt)
      ? startDateFromProps
      : resetAt || createdAt
  })

  const prevEndDate = useRef<Date | null>(null)
  const [endDate, setEndDate] = useState<Date>((): Date => {
    const endDateFromProps: Date | null =
      endDateFromPropsString && isValid(parseISO(endDateFromPropsString))
        ? parseISO(endDateFromPropsString)
        : null
    const deletedAt: Date | null =
      deletedAtString && isValid(parseISO(deletedAtString)) ? parseISO(deletedAtString) : null

    return deletedAt && endDateFromProps && isBefore(endDateFromProps, deletedAt)
      ? endDateFromProps
      : !deletedAt && endDateFromProps
        ? endDateFromProps
        : deletedAt || new Date()
  })

  const {
    minDate,
    maxDate,
  }: {
    minDate: Date
    maxDate: Date
  } = useMemo(() => {
    const createdAt: Date | null =
      createdAtString && isValid(parseISO(createdAtString)) ? parseISO(createdAtString) : null
    const resetAt: Date | null =
      resetAtString && isValid(parseISO(resetAtString)) ? parseISO(resetAtString) : null
    const deletedAt: Date | null =
      deletedAtString && isValid(parseISO(deletedAtString)) ? parseISO(deletedAtString) : null

    return {
      minDate: resetAt || createdAt || new Date(),
      maxDate: deletedAt || new Date(),
    }
  }, [
    createdAtString,
    deletedAtString,
    resetAtString,
  ])

  const umamiUrl = useMemo(() => {
    const umamiPath = `${teamId ? `/teams/${teamId}` : ''}/websites/${id}/`
    return new URL(umamiPath, process.env.NEXT_PUBLIC_UMAMI_URL).toString()
  }, [
    id,
    teamId,
  ])

  const { openModal, closeModal } = useModal()

  const handleModalOpen = useCallback(() => {
    prevStartDate.current = startDate
    prevEndDate.current = endDate
    openModal(modalSlug)
  }, [
    openModal,
    endDate,
    startDate,
  ])

  const handleConfirm = useCallback(() => {
    if (startDate && endDate) {
      setSelectedTimeSpan(startDate, endDate)
      prevStartDate.current = startDate
      prevEndDate.current = endDate
    }
    closeModal(modalSlug)
  }, [
    closeModal,
    endDate,
    setSelectedTimeSpan,
    startDate,
  ])

  const handleCancel = useCallback(() => {
    setStartDate(prevStartDate.current)
    setEndDate(prevEndDate.current)
    closeModal(modalSlug)
  }, [
    closeModal,
  ])

  return (
    <div className="w-full flex flex-row justify-between items-center py-4">
      {!website ? (
        <Skeleton className='h-12 w-full"' />
      ) : (
        <>
          <div
            className={cn([
              'flex flex-col',
              'font-mono',
            ])}
          >
            <div className="text-xs md:text-sm lg:text-md text-muted-foreground">
              Umami Controls:
            </div>
            <Link
              className="text-md md:text-lg lg:text-xl no-underline font-medium leading-none"
              href={umamiUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{name}</span>
            </Link>
          </div>

          <Button
            buttonStyle="primary"
            type="button"
            size="large"
            onClick={handleModalOpen}
            className="font-medium my-0"
          >
            {formatDate(startDate, 'dd/MM/yyyy')}
            {' - '}
            {formatDate(endDate, 'dd/MM/yyyy')}
          </Button>

          <FullscreenModal
            slug={modalSlug}
            trapFocus={true}
            lockBodyScroll={true}
            closeOnBlur={true}
          >
            <div
              className={cn([
                'modal__wrap',
                'absolute inset-0',
                'bg-background/30',
                'backdrop-blur-sm',
                'flex items-center justify-center',
              ])}
            >
              <div className="modal__container flex flex-col gap-2 bg-background p-6">
                <header className="modal__header">
                  <h3 className="font-mono font-medium mb-2 tracking-tight">Select Date Range</h3>
                </header>

                <style>{`
                  .modal__body {
                    .date-time-picker__icon-wrap,
                    .react-datepicker__day-names {
                      display: none;
                    }
                    .react-datepicker__header {
                      padding-bottom: 0;
                    }
                    .react-datepicker__day--selected {
                      background-color: var(--color-primary);
                      color: var(--color-primary-foreground);
                    }
                    .react-datepicker__month-select,
                    .react-datepicker__year-select {
                      font-family: var(--font-mono);
                    }
                  }
                `}</style>
                <div
                  className={cn([
                    'modal__body flex flex-row gap-2',
                  ])}
                >
                  <DatePicker
                    displayFormat="MM/dd/yyyy"
                    pickerAppearance="dayOnly"
                    overrides={{
                      inline: true,
                      isClearable: false,
                      fixedHeight: true,
                      calendarStartDay: 1,
                      startDate,
                      endDate,
                      minDate: minDate,
                      maxDate: endDate,
                      selected: startDate,
                      onChange: setStartDate,
                      selectsStart: true,
                    }}
                  />
                  <DatePicker
                    displayFormat="MM/dd/yyyy"
                    pickerAppearance="dayOnly"
                    overrides={{
                      inline: true,
                      isClearable: false,
                      fixedHeight: true,
                      calendarStartDay: 1,
                      startDate,
                      endDate,
                      minDate: startDate,
                      maxDate: maxDate,
                      selected: endDate,
                      onChange: setEndDate,
                      selectsEnd: true,
                    }}
                  />
                </div>

                <footer className="modal__footer flex flex-row justify-end gap-2">
                  <Button buttonStyle="secondary" type="button" size="large" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button buttonStyle="primary" type="button" size="large" onClick={handleConfirm}>
                    Apply
                  </Button>
                </footer>
              </div>
            </div>
          </FullscreenModal>
        </>
      )}
    </div>
  )
}
