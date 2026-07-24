import {
  addDays,
  differenceInCalendarMonths,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subHours,
  subMonths,
} from 'date-fns'

export type IntervalValue = [
  Date,
  Date,
]

class IntervalError extends Error {
  constructor(interval: unknown) {
    super()
    this.name = 'IntervalError'
    this.message = `Invalid interval value: ${JSON.stringify(interval)}`
  }
}

export class Interval {
  #value: IntervalValue

  constructor(startDate?: string | Date, endDate?: string | Date) {
    this.#value = this.#createIntervalValue(startDate, endDate)
  }

  /**
   * Validates that the input is a valid interval value consisting of an array with exactly two Date objects.
   * Throws an error if validation fails.
   *
   * @param input - The value to validate as an interval
   * @return True if the input is a valid interval (array of two Date objects)
   * @throws {IntervalError} When the input is not an array, doesn't contain exactly two elements, or contains non-Date values
   */
  #validateIntervalValue(input: unknown): input is Interval {
    const isValidIntervalValue =
      Array.isArray(input) && input.every((date) => date instanceof Date) && input.length === 2
    if (!isValidIntervalValue) throw new IntervalError(input)
    return true
  }

  #createIntervalValue(startDate?: string | Date, endDate?: string | Date): IntervalValue {
    const tuple = [
      startDate ? new Date(startDate) : new Date(),
      endDate ? new Date(endDate) : new Date(),
    ].sort((a, b) => a.getTime() - b.getTime()) as IntervalValue

    if (this.#validateIntervalValue(tuple)) return tuple
  }

  get #durationMilliseconds(): number {
    return Math.abs(this.#value[0].getTime() - this.#value[1].getTime())
  }

  /**
   * Moves an interval forward or backward in time by a specified number of steps.
   * Each step represents the duration of the input interval itself.
   * A positive steps value moves the interval forward, while a negative value moves it backward.
   *
   * @param input - The interval to move, represented as a tuple of two Date objects
   * @param steps - The number of interval durations to move; positive for forward, negative for backward
   * @return A new interval with both start and end dates shifted by the specified number of steps
   */
  public moveInterval(steps: number): Interval {
    const durationMillis = this.#durationMilliseconds

    this.startTime = this.startTime + steps * durationMillis
    this.endTime = this.endTime + steps * durationMillis
    return this
  }

  public get value(): IntervalValue {
    return this.#value
  }

  public set value(value: IntervalValue) {
    if (this.#validateIntervalValue(value)) {
      this.#value = value
    }
  }

  public get ISOStringValue() {
    return [
      this.#value[0].toISOString(),
      this.#value[1].toISOString(),
    ]
  }

  public get startDate(): Date {
    return this.#value[0]
  }

  public set startDate(date: Date) {
    this.#value[0] = date
  }

  public get ISOStringStartDate() {
    return this.#value[0].toISOString()
  }

  public get ISOStringEndDate() {
    return this.#value[1].toISOString()
  }

  public get endDate(): Date {
    return this.#value[1]
  }

  public set endDate(date: Date) {
    this.#value[1] = date
  }

  public get startTime(): number {
    return this.#value[0].getTime()
  }

  public set startTime(time: number) {
    this.#value[0] = new Date(time)
  }

  public get endTime(): number {
    return this.#value[1].getTime()
  }

  public set endTime(time: number) {
    this.#value[1] = new Date(time)
  }

  public get differenceInMilliseconds(): number {
    return this.#durationMilliseconds
  }

  public get differenceInSeconds(): number {
    return differenceInSeconds(this.endDate, this.startDate)
  }

  public get differenceInMinutes(): number {
    return differenceInMinutes(this.endDate, this.startDate)
  }

  public get differenceInHours(): number {
    return differenceInHours(this.endDate, this.startDate)
  }

  public get differenceInDays(): number {
    return differenceInDays(this.endDate, this.startDate)
  }

  public get differenceInMonths(): number {
    return differenceInMonths(addDays(endOfMonth(this.endDate), 1), startOfMonth(this.startDate))
  }

  /**
   * Merges overlapping or adjacent time intervals into a consolidated list of non-overlapping intervals.
   * The method validates each interval, sorts them by start time, and combines any intervals that overlap
   * or touch. When intervals overlap, the merged interval extends to the maximum end time of the overlapping intervals.
   *
   * @param intervals - An array of time intervals to be merged, where each interval is a tuple of two Date objects representing the start and end times
   * @return A new array of merged intervals with no overlaps, sorted by start time
   */
  static mergeIntervals(intervals: Interval[]): Interval[] {
    intervals.sort((a, b) => a.startTime - b.startTime)

    const result: Interval[] = [
      intervals[0],
    ]

    for (let i = 1; i < intervals.length; i++) {
      if (intervals[i].startTime <= result[result.length - 1].endTime) {
        result[result.length - 1].endTime = Math.max(
          result[result.length - 1].endTime,
          intervals[i].endTime,
        )
      } else {
        result.push(intervals[i])
      }
    }

    return result
  }

  /**
   *
   */
  public setToToday(): Interval {
    this.startDate = new Date(startOfDay(new Date()))
    this.endDate = new Date(endOfDay(new Date()))
    return this
  }

  /**
   * Last Twenty-Four Hours
   */
  public setToLastTwentyFourHours(): Interval {
    this.endDate = new Date()
    this.startDate = new Date(subHours(this.endDate, 24))
    return this
  }

  /**
   * This Week
   */
  public setToThisWeek(): Interval {
    this.startDate = new Date(
      startOfWeek(new Date(), {
        weekStartsOn: 1,
      }),
    )
    this.endDate = new Date(
      endOfWeek(new Date(), {
        weekStartsOn: 1,
      }),
    )
    return this
  }

  /**
   * Last Seven Days
   */
  public setToLastSevenDays(): Interval {
    this.startDate = new Date(startOfDay(subDays(new Date(), 7)))
    this.endDate = new Date(endOfDay(new Date()))
    return this
  }

  /**
   * This Month
   */
  public setToThisMonth(): Interval {
    this.startDate = new Date(startOfMonth(new Date()))
    this.endDate = new Date(endOfMonth(new Date()))
    return this
  }

  /**
   * Last Thirty Days
   */
  public setToLastThirtyDays(): Interval {
    this.startDate = new Date(startOfDay(subDays(new Date(), 30)))
    this.endDate = new Date(endOfDay(new Date()))
    return this
  }

  /**
   * Last Ninety Days
   */
  public setToLastNinetyDays(): Interval {
    this.startDate = new Date(startOfDay(subDays(new Date(), 90)))
    this.endDate = new Date(endOfDay(new Date()))
    return this
  }

  /**
   * This Year
   */
  public setToThisYear(): Interval {
    this.startDate = new Date(startOfYear(new Date()))
    this.endDate = new Date(endOfYear(new Date()))
    return this
  }

  /**
   * Last Six Months
   */
  public setToLastSixMonths(): Interval {
    this.startDate = new Date(startOfDay(subMonths(new Date(), 6)))
    this.endDate = new Date(endOfDay(new Date()))
    return this
  }

  /**
   * Last Twelve Months
   */
  public setToLastTwelveMonths(): Interval {
    this.startDate = new Date(startOfDay(subMonths(new Date(), 12)))
    this.endDate = new Date(endOfDay(new Date()))
    return this
  }
}
