export * from './Duration'
export * from './Interval'

/**
 * Get the time zone offset in minutes
 * @link https://stackoverflow.com/questions/21327371/get-timezone-offset-from-timezone-name-using-javascript
 */
export const getTimeZoneOffsetMinutes = (
  timeZone: string = 'UTC',
  date: Date = new Date(),
): number => {
  const utcDate = new Date(
    date.toLocaleString('en-US', {
      timeZone: 'UTC',
    }),
  )
  const tzDate = new Date(
    date.toLocaleString('en-US', {
      timeZone,
    }),
  )
  return (tzDate.getTime() - utcDate.getTime()) / 6e4
}

/**
 * Get the time zone offset in milliseconds
 * @link https://stackoverflow.com/questions/21327371/get-timezone-offset-from-timezone-name-using-javascript
 */
export const getTimeZoneOffsetMillis = (
  timeZone: string = 'UTC',
  date: Date = new Date(),
): number => {
  return getTimeZoneOffsetMinutes(timeZone, date) * 60000
}

/**
 * Get the local ISO string
 * @link https://stackoverflow.com/questions/10830357/javascript-toisostring-ignores-timezone-offset
 */
export const getLocalISOString = (timeZone: string = 'UTC', date: Date = new Date()) => {
  const offset = getTimeZoneOffsetMillis(timeZone, date)
  return new Date(Date.now() + offset).toISOString().slice(0, -1)
}
