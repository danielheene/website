import { format } from 'date-fns'

const DATE_FORMAT = 'MM/yyyy'

/**
 * Generates a time span label for an experience entry
 * @param startDate
 * @param endDate
 * @param locale
 */
export const generateExperienceTimeSpan = ({ startDate, endDate, locale = 'en' }: {
  startDate: string,
  endDate?: string,
  locale?: string
}): string => {
  if (startDate && endDate) {
    return `${format(startDate, DATE_FORMAT)} - ${format(endDate, DATE_FORMAT)}`
  }
  if (startDate && !endDate) {
    const localizedSince = locale === 'de' ? 'seit' : 'since'
    return `${localizedSince} ${format(startDate, DATE_FORMAT)}`
  }
  return ''
}
