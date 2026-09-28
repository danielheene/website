/**
 * Newest of the given timestamps as an ISO string, or undefined when none is
 * valid. Accepts Date instances as well as strings: typed as strings, Payload
 * timestamps can still arrive as Dates at runtime, and a bare `.sort()` would
 * then compare their `toString()` forms (weekday first).
 */
export const latestTimestamp = (
  ...dates: (Date | string | null | undefined)[]
): string | undefined => {
  let latest: number | undefined

  for (const date of dates) {
    if (!date) continue
    const time = new Date(date).getTime()
    if (!Number.isNaN(time) && (latest === undefined || time > latest)) latest = time
  }

  return latest === undefined ? undefined : new Date(latest).toISOString()
}
