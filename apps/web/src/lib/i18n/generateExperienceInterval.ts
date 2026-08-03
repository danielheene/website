import type { Locale } from './shared'
import { translate } from './translate'

/**
 * Generates a time span label for an experience entry
 * @param startDate
 * @param endDate
 * @param locale
 */
export const generateExperienceInterval = ({
  startDate,
  endDate,
  locale = 'en',
}: {
  startDate: string
  endDate?: string
  locale?: Locale
}): string => {
  if (startDate && endDate) {
    return translate(locale, 'interval.finished', {
      startDate,
      endDate,
    })
  }
  if (startDate && !endDate) {
    return translate(locale, 'interval.ongoing', {
      startDate,
    })
  }
  return ''
}
