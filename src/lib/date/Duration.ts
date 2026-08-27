import {
  Duration as DurationValue,
  hoursToMilliseconds,
  intervalToDuration,
  milliseconds,
  millisecondsToHours,
  millisecondsToMinutes,
  millisecondsToSeconds,
  minutesToMilliseconds,
  secondsToMilliseconds,
} from 'date-fns'
import {
  millisecondsInDay,
  millisecondsInHour,
  millisecondsInMinute,
  millisecondsInSecond,
} from 'date-fns/constants'
import prettyMilliseconds from 'pretty-ms'
import timestring from 'timestring'

class DurationError extends Error {
  constructor(value: unknown) {
    super()
    this.name = 'DurationError'
    this.message = `Cannot create Duration from value: ${JSON.stringify(value)}`
  }
}

export class Duration {
  #duration: DurationValue

  /**
   * Creates a new instance with the specified duration in milliseconds.
   * Converts the duration from milliseconds to an interval duration object
   * representing the time span from 0 to the given value.
   *
   * @param {number} durationMillis - The duration in milliseconds to be converted and stored
   */
  private constructor(durationMillis: number) {
    this.#duration = this.#intervalFromMilliseconds(durationMillis)
  }

  #intervalFromMilliseconds(milliseconds: number): DurationValue {
    return intervalToDuration({
      start: 0,
      end: milliseconds,
    })
  }

  #intervalToMilliseconds(duration: DurationValue): number {
    return milliseconds(duration)
  }

  /**
   * Gets the duration value in milliseconds.
   *
   * @return {number} The total number of milliseconds represented by this duration.
   */
  get #milliseconds(): number {
    return this.#intervalToMilliseconds(this.#duration)
  }

  /**
   * Creates an Duration instance from a string representation of time.
   * Parses a human-readable duration string and converts it to milliseconds.
   *
   * @param duration - A string representing a duration (e.g., "2h", "30m", "1d 12h")
   * @return A new Duration instance representing the parsed time duration
   */
  static fromString(duration: string): Duration {
    const milliseconds = timestring(duration, 'ms')
    if (!Number.isSafeInteger(milliseconds)) throw new DurationError(duration)

    return new Duration(milliseconds)
  }

  /**
   * Creates an Duration instance from a number of seconds.
   *
   * @param seconds - The number of seconds to create the duration from
   * @return A new Duration instance representing the given number of seconds
   */
  static fromSeconds(seconds: number): Duration {
    return new Duration(seconds * millisecondsInSecond)
  }

  /**
   * Creates an Duration instance from a number of minutes.
   *
   * @param minutes - The number of minutes to create the duration from
   * @return A new Duration instance representing the given number of minutes
   */
  static fromMinutes(minutes: number): Duration {
    return new Duration(minutes * millisecondsInMinute)
  }

  /**
   * Creates an Duration instance from a number of hours.
   *
   * @param hours - The number of hours to create the duration from
   * @return A new Duration instance representing the given number of hours
   */
  static fromHours(hours: number): Duration {
    return new Duration(hours * millisecondsInHour)
  }

  /**
   * Creates an Duration instance from a number of days.
   *
   * @param days - The number of days to create the duration from
   * @return A new Duration instance representing the given number of days
   */
  static fromDays(days: number): Duration {
    return new Duration(days * millisecondsInDay)
  }

  /**
   * Sets seconds to given value
   *
   * @param seconds - The number of seconds to set for this duration
   * @return This Duration instance for method chaining
   */
  public setSeconds(seconds: number): Duration {
    this.#duration.seconds = seconds
    return this
  }

  /**
   * Sets minutes to given value
   *
   * @param minutes - The number of minutes to set for this duration
   * @return This Duration instance for method chaining
   */
  public setMinutes(minutes: number): Duration {
    this.#duration.minutes = minutes
    return this
  }

  /**
   * Sets hours to given value
   *
   * @param hours - The number of hours to set for this duration
   * @return This Duration instance for method chaining
   */
  public setHours(hours: number): Duration {
    this.#duration.hours = hours
    return this
  }

  /**
   * Sets days to given value
   *
   * @param days - The number of days to set for this duration
   * @return This Duration instance for method chaining
   */
  public setDays(days: number): Duration {
    this.#duration.days = days
    return this
  }

  public addMilliseconds(milliseconds: number): Duration {
    this.#duration = this.#intervalFromMilliseconds(this.#milliseconds + milliseconds)
    return this
  }

  public addSeconds(seconds: number): Duration {
    this.#duration = this.#intervalFromMilliseconds(
      this.#milliseconds + secondsToMilliseconds(seconds),
    )
    return this
  }

  public addMinutes(minutes: number): Duration {
    this.#duration = this.#intervalFromMilliseconds(
      this.#milliseconds + minutesToMilliseconds(minutes),
    )
    return this
  }

  public addHours(hours: number): Duration {
    this.#duration = this.#intervalFromMilliseconds(this.#milliseconds + hoursToMilliseconds(hours))
    return this
  }

  public addDays(days: number): Duration {
    this.#duration = this.#intervalFromMilliseconds(this.#milliseconds + millisecondsInDay * days)
    return this
  }

  /**
   * Returns the duration in milliseconds
   *
   * @return The duration in milliseconds
   */
  public toMilliseconds(): number {
    return this.#milliseconds
  }

  /**
   * Returns the duration in seconds
   *
   * @return The duration in seconds
   */
  public toSeconds(): number {
    return millisecondsToSeconds(this.#milliseconds)
  }

  /**
   * Returns the duration in minutes
   *
   * @return The duration in minutes
   */
  public toMinutes(): number {
    return millisecondsToMinutes(this.#milliseconds)
  }

  /**
   * Returns the duration in hours
   *
   * @return The duration in hours
   */
  public toHours(): number {
    return millisecondsToHours(this.#milliseconds)
  }

  /**
   * Returns the duration in a human-readable format
   *
   * @return The duration in a human-readable format
   */
  public toPretty(): string {
    return prettyMilliseconds(this.#milliseconds)
  }
}
