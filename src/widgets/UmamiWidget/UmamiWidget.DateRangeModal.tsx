'use client'

import { DatePicker } from '@payloadcms/ui'

import { Button } from '@/components/Button'
import { cn } from '@/lib/cn'
import { Interval } from '@/lib/date'

const QUICK_SELECT_CONFIG: {
  label: string
  variant: 'outline' | 'secondary'
  apply: (interval: Interval) => Interval
}[] = [
  {
    label: 'Today',
    variant: 'outline',
    apply: (interval) => interval.setToToday(),
  },
  {
    label: 'This Week',
    variant: 'secondary',
    apply: (interval) => interval.setToThisWeek(),
  },
  {
    label: 'Last 30 Days',
    variant: 'secondary',
    apply: (interval) => interval.setToLastThirtyDays(),
  },
  {
    label: 'This Month',
    variant: 'secondary',
    apply: (interval) => interval.setToThisMonth(),
  },
  {
    label: 'Last 90 Days',
    variant: 'secondary',
    apply: (interval) => interval.setToLastNinetyDays(),
  },
  {
    label: 'This Year',
    variant: 'secondary',
    apply: (interval) => interval.setToThisYear(),
  },
  {
    label: 'Last 12 Months',
    variant: 'secondary',
    apply: (interval) => interval.setToLastTwelveMonths(),
  },
]

interface DateRangeModalProps {
  tempStartDate: Date
  tempEndDate: Date
  setTempStartDate: (date: Date) => void
  setTempEndDate: (date: Date) => void
  minDate: Date
  maxDate: Date
  startDate: Date
  endDate: Date
  onQuickSelect: (interval: Interval) => void
  onCancel: () => void
  onConfirm: () => void
}

export const DateRangeModal = ({
  tempStartDate,
  tempEndDate,
  setTempStartDate,
  setTempEndDate,
  minDate,
  maxDate,
  startDate,
  endDate,
  onQuickSelect,
  onCancel,
  onConfirm,
}: DateRangeModalProps) => {
  return (
    <div
      className={cn([
        'modal__wrap',
        'absolute inset-0',
        'bg-background/30',
        'backdrop-blur-sm',
        'flex items-center justify-center',
      ])}
    >
      <div className="modal__container flex flex-col gap-8 bg-background p-6">
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
            'modal__body flex flex-row gap-8',
          ])}
        >
          <div className="flex flex-col gap-2">
            {QUICK_SELECT_CONFIG.map(({ label, variant, apply }) => (
              <Button
                key={label}
                type="button"
                variant={variant}
                size="xs"
                onClick={() => onQuickSelect(apply(new Interval()))}
              >
                {label}
              </Button>
            ))}
          </div>
          <DatePicker
            displayFormat="MM/dd/yyyy"
            pickerAppearance="dayOnly"
            overrides={{
              inline: true,
              isClearable: false,
              fixedHeight: true,
              calendarStartDay: 1,
              startDate: tempStartDate,
              endDate: tempEndDate,
              minDate: minDate,
              maxDate: endDate,
              selected: tempStartDate,
              onChange: setTempStartDate,
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
              startDate: tempStartDate,
              endDate: tempEndDate,
              minDate: startDate,
              maxDate: maxDate,
              selected: tempEndDate,
              onChange: setTempEndDate,
              selectsEnd: true,
            }}
          />
        </div>

        <footer className="modal__footer flex flex-row justify-end gap-2">
          <Button size="lg" variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="lg" variant="default" type="button" onClick={onConfirm}>
            Apply
          </Button>
        </footer>
      </div>
    </div>
  )
}
