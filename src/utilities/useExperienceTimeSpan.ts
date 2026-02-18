import { format } from 'date-fns'
import { useMemo } from 'react'

const DATE_FORMAT = 'MM/yyyy'

export const useExperienceTimeSpan = (startDate: string, endDate?: string): string => {
  return useMemo(() => {
    if (startDate && endDate) {
      return `${format(startDate, DATE_FORMAT)} - ${format(endDate, DATE_FORMAT)}`
    }
    if (startDate && !endDate) {
      return `since ${format(startDate, DATE_FORMAT)}`
    }
    return null
  }, [startDate, endDate])
}
