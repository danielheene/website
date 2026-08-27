/** Recursively omit the given keys `K` from every object in `T`. */
type WithoutKeys<T, K extends string> = T extends readonly (infer U)[]
  ? WithoutKeys<U, K>[]
  : T extends (...args: never[]) => unknown
    ? T
    : T extends object
      ? { [P in keyof T as P extends K ? never : P]: WithoutKeys<T[P], K> }
      : T

/**
 * Deep-clones `obj` and recursively removes the provided `keys` from every
 * nested object. The returned value is typed with those keys omitted.
 */
export function removeObjectKeys<T, const K extends string = never>(
  obj: T,
  keys: readonly K[] = [],
): WithoutKeys<T, K> {
  const clone = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(clone)
    }

    if (typeof value === 'object' && value !== null) {
      const result: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(value)) {
        if (keys.includes(key as K)) continue
        result[key] = clone(val)
      }
      return result
    }

    return value
  }

  return clone(obj) as WithoutKeys<T, K>
}
