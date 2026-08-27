import { type FormatDurationOptions, formatDuration, intervalToDuration } from 'date-fns'

/**
 * Formats seconds to a human-readable duration string
 * @param seconds
 */
export const formatSecondsToDuration = (seconds: number = 0) => {
  const formatDistanceLocale = {
    xSeconds: '{{count}}s',
    xMinutes: '{{count}}m',
    xHours: '{{count}} h',
  }

  const durationOptions = {
    format: [
      'hours',
      'minutes',
      'seconds',
    ],
    zero: false,
    delimiter: ' ',
    locale: {
      formatDistance: (token: string, count: number) =>
        formatDistanceLocale[token].replace('{{count}}', count.toString()),
    },
  } as FormatDurationOptions

  return seconds > 0
    ? formatDuration(
        intervalToDuration({
          start: 0,
          end: seconds * 1000,
        }),
        durationOptions,
      )
    : '0s'
}
