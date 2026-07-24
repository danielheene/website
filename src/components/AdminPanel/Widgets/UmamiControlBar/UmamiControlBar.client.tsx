'use client'

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Button, DatePicker, FullscreenModal, useModal } from '@payloadcms/ui'

import { formatDate, parseISO } from 'date-fns'

import { Skeleton } from '@/components/Skeleton'
import { useUmamiCharts } from '@/contexts/UmamiCharts'
import { cn } from '@/lib/cn'

const modalSlug = 'umami-date-picker'

interface UmamiControlBarClientProps {
  startDate: string
  endDate: string
  minDate: string
  maxDate: string
  domain: string | null
  id: string | null
  name: string | null
  teamId: string | null
}

export const UmamiControlBarClient = ({
  startDate: startDateFromProps,
  endDate: endDateFromProps,
  minDate: minDateFromProps,
  maxDate: maxDateFromProps,
  domain,
  id,
  name,
  teamId,
}: UmamiControlBarClientProps) => {
  const { selectedInterval, website, setSelectedInterval, registerControlBar } = useUmamiCharts()

  console.log('website', website)

  useEffect(
    () => registerControlBar(),
    [
      registerControlBar,
    ],
  )

  const prevStartDate = useRef<Date | null>(null)
  const [startDate, setStartDate] = useState<Date>(parseISO(startDateFromProps))

  const prevEndDate = useRef<Date | null>(null)
  const [endDate, setEndDate] = useState<Date>(parseISO(endDateFromProps))

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
    startTransition(() => {
      prevStartDate.current = startDate
      prevEndDate.current = endDate
      openModal(modalSlug)
    })
  }, [
    openModal,
    endDate,
    startDate,
  ])

  const handleConfirm = useCallback(() => {
    startTransition(() => {
      if (startDate && endDate) {
        prevStartDate.current = startDate
        prevEndDate.current = endDate
        setSelectedInterval(startDate, endDate)
        setStartDate(startDate)
        setEndDate(endDate)
      }
      closeModal(modalSlug)
    })
  }, [
    closeModal,
    endDate,
    setSelectedInterval,
    startDate,
  ])

  const handleCancel = useCallback(() => {
    startTransition(() => {
      setStartDate(prevStartDate.current)
      setEndDate(prevEndDate.current)
      closeModal(modalSlug)
    })
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
