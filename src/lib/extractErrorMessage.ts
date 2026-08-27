/**
 * https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
 */

interface ErrorWithMessage {
  message: string
}

/**
 * test an unknown error object whether it contains a "message" property
 * @param error
 * @returns
 */
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

/**
 * convert error into a new error object containing a "message" property
 * @param maybeError
 * @returns
 */
export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError))
  }
}

/**
 * write the text from the "message" property of the error object
 * @param error
 * @returns
 */
export function extractErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message
}
