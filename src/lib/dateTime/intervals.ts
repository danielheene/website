import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  startOfDay,
  endOfDay,
  subMonths,
  subHours,
  startOfYear,
  endOfYear
} from 'date-fns'


type Interval = [Date, Date]

class InvalidIntervalError extends Error {
  constructor(message: string, interval: unknown) {
    super(message)
    this.name = 'InvalidIntervalError'
    this.message = `Invalid interval value:\n${JSON.stringify(interval, null, 2)}`
  }
}

export const Intervals = new (class Intervals {
  /**
   * Moves an interval forward or backward in time by a specified number of steps.
   * Each step represents the duration of the input interval itself.
   * A positive steps value moves the interval forward, while a negative value moves it backward.
   *
   * @param input - The interval to move, represented as a tuple of two Date objects
   * @param steps - The number of interval durations to move; positive for forward, negative for backward
   * @return A new interval with both start and end dates shifted by the specified number of steps
   */
  moveInterval(input: Interval, steps: number): Interval {
    this.#validateIntervalValue(input)
    const durationMillis = this.#getIntervalDurationMillis(input)
    const [startDate, endDate] = this.#sortInterval(input)
    return [new Date(startDate.getTime() + steps * durationMillis), new Date(endDate.getTime() + steps * durationMillis)]
  }

  /**
   * Validates that the input is a valid interval value consisting of an array with exactly two Date objects.
   * Throws an error if validation fails.
   *
   * @param input - The value to validate as an interval
   * @return True if the input is a valid interval (array of two Date objects)
   * @throws {InvalidIntervalError} When the input is not an array, doesn't contain exactly two elements, or contains non-Date values
   */
  #validateIntervalValue(input: unknown): input is Interval {
    const isValidIntervalValue = Array.isArray(input) && input.every((date) => date instanceof Date) && input.length === 2
    if (!isValidIntervalValue) throw new InvalidIntervalError('Invalid interval value', input)
    return true
  }

  /**
   * Sorts an interval array in ascending order based on the timestamp values of the dates.
   * Validates the input interval before sorting and returns a new sorted interval with dates arranged chronologically.
   *
   * @param {Interval} input - The interval array containing two date objects to be sorted
   * @return {Interval} A sorted interval array with dates in chronological order (earliest date first)
   */
  #sortInterval(input: Interval): Interval {
    this.#validateIntervalValue(input)
    return input.sort((a, b) => a.getTime() - b.getTime())
  }

  /**
   * Calculates milliseconds between two dates in an interval.
   * Validates the interval and returns the absolute difference between the two dates.
   * Throws an error if the resulting duration is negative or NaN.
   *
   * @param {Interval} input - An interval containing two Date objects representing the start and end points
   * @return {number} The absolute duration in milliseconds between the two dates in the interval
   * @throws {InvalidIntervalError} When the interval is invalid or results in a negative or NaN duration
   */
  #getIntervalDurationMillis(input: Interval): number {
    this.#validateIntervalValue(input)
    const milliSeconds = Math.abs(input[0].getTime() - input[1].getTime())
    if (milliSeconds < 0 || Number.isNaN(milliSeconds)) throw new InvalidIntervalError('Invalid interval value', input)
    return milliSeconds
  }

  /**
   *
   */
  get today(): Interval {
    const startDate = new Date(startOfDay(new Date()))
    const endDate = new Date(endOfDay(new Date()))
    return [startDate, endDate]
  }

  /**
   * Last Twenty Four Hours
   */
  get lastTwentyFourHours(): Interval {
    const endDate = new Date()
    const startDate = new Date(subHours(endDate, 24))
    return [startDate, endDate]
  }

  /**
   * This Week
   */
  get thisWeek(): Interval {
    const startDate = new Date(startOfWeek(new Date(), { weekStartsOn: 1 }))
    const endDate = new Date(endOfWeek(new Date(), { weekStartsOn: 1 }))
    return [startDate, endDate]
  }

  /**
   * Last Seven Days
   */
  get lastSevenDays(): Interval {
    const startDate = new Date(startOfDay(subDays(new Date(), 7)))
    const endDate = new Date(endOfDay(new Date()))
    return [startDate, endDate]
  }


  /**
   * This Month
   */
  get thisMonth(): Interval {
    const startDate = new Date(startOfMonth(new Date()))
    const endDate = new Date(endOfMonth(new Date()))
    return [startDate, endDate]
  }

  /**
   * Last Thirty Days
   */
  get lastThirtyDays(): Interval {
    const endDate = new Date(endOfDay(new Date()))
    const startDate = new Date(startOfDay(subDays(new Date(), 30)))
    return [startDate, endDate]
  }

  /**
   * Last Ninety Days
   */
  get lastNinetyDays(): Interval {
    const endDate = new Date(endOfDay(new Date()))
    const startDate = new Date(startOfDay(subDays(new Date(), 90)))
    return [startDate, endDate]
  }

  /**
   * This Year
   */
  get thisYear(): Interval {
    const startDate = new Date(startOfYear(new Date()))
    const endDate = new Date(endOfYear(new Date()))
    return [startDate, endDate]
  }

  /**
   * Last Six Months
   */
  get lastSixMonths(): Interval {
    const endDate = new Date(endOfDay(new Date()))
    const startDate = new Date(startOfDay(subMonths(new Date(), 6)))
    return [startDate, endDate]
  }

  /**
   * Last Twelve Months
   */
  get lastTwelveMonths(): Interval {
    const endDate = new Date(endOfDay(new Date()))
    const startDate = new Date(startOfDay(subMonths(new Date(), 12)))
    return [startDate, endDate]
  }



})()
