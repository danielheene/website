type SanitizeObjectKeys = string[]
type SanitizeObjectOptions = { removeKeys?: SanitizeObjectKeys; maxDepth?: number }

/**
 * Sanitizes an object by removing specified keys, empty values, or exceeding a specified depth.
 *
 * @param {unknown} obj The object to be sanitized. It can be of any type, but only objects will be processed.
 * @param {SanitizeObjectKeys | SanitizeObjectOptions} [options] Optional configuration for sanitization. This can be:
 * - An array of strings specifying keys to be removed.
 * - An object containing:
 *   - `removeKeys` (an array of strings): Specific keys to remove from the object.
 *   - `maxDepth` (a number): The maximum depth to recurse into nested objects. Defaults to Infinity.
 * @return {Record<string, unknown> | undefined} The sanitized object, or undefined if the object passed was of an unsupported type.
 */
export function sanitizeObject(obj: unknown, options?: SanitizeObjectKeys | SanitizeObjectOptions): Record<string, unknown> | undefined {
  const tempObj: Record<string, unknown> = JSON.parse(JSON.stringify(obj))

  const removeKeys: string[] = Array.isArray(options)
    ? options
    : typeof options === 'object' && 'removeKeys' in options && Array.isArray(options.removeKeys)
      ? options.removeKeys
      : []
  const remainingDepth: number =
    typeof options === 'object' && 'maxDepth' in options && typeof options.maxDepth === 'number' ? options.maxDepth : Infinity

  Object.keys(tempObj).forEach((key) => {
    /* remove manually defined keys first */
    if (removeKeys.includes(key)) delete tempObj[key]

    /* delete only empty values as falsy values might have been purpose */
    if (tempObj[key] === null) delete tempObj[key]
    if (tempObj[key] === undefined) delete tempObj[key]

    /* walk through nested objects first so further sanitization can be applied */
    if (typeof tempObj[key] === 'object' && remainingDepth > 1) {
      tempObj[key] = sanitizeObject(tempObj[key] as Record<string, unknown>, {
        removeKeys,
        maxDepth: remainingDepth - 1,
      })
    }

    /* delete empty strings, empty objects, functions, etc. */
    if (typeof tempObj[key] === 'undefined') delete tempObj[key]
    if (typeof tempObj[key] === 'function') delete tempObj[key]
    if (typeof tempObj[key] === 'string' && tempObj[key].trim() === '') delete tempObj[key]
    if (typeof tempObj[key] === 'object' && JSON.stringify(tempObj[key]) === '{}') delete tempObj[key]
  })

  return tempObj
}
