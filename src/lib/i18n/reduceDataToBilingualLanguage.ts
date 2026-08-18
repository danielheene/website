import { Traverse } from 'neotraverse/modern'

import type { BilingualLanguage } from './shared'

/**
 * Recursive type that selects the localized value from objects containing only locale keys.
 */
export type ReducedToBilingualLanguage<T, L extends BilingualLanguage = 'en'> = T extends
  | null
  | undefined
  ? T
  : T extends Array<infer V>
    ? Array<ReducedToBilingualLanguage<V, L>>
    : T extends object
      ? L extends keyof T
        ? keyof T extends BilingualLanguage
          ? ReducedToBilingualLanguage<T[L], L>
          : { [K in keyof T]: ReducedToBilingualLanguage<T[K], L> }
        : { [K in keyof T]: ReducedToBilingualLanguage<T[K], L> }
      : T

/**
 * Deep selects localized values from an object based on a locale key ('en' or 'de').
 *
 * If an object contains a key matching the requested locale and its keys are restricted to locales,
 * it is replaced by the value of that key. This continues recursively.
 *
 * @param data The object to process.
 * @param locale The locale to select ('en' or 'de', defaults to 'en').
 * @returns A new object with localized values selected.
 */
export const reduceDataToBilingualLanguage = <T, L extends BilingualLanguage = 'en'>(
  data: T,
  locale: L = 'en' as L,
): ReducedToBilingualLanguage<T, L> => {
  const locales: string[] = [
    'en',
    'de',
  ]
  return new Traverse(data).forEach((ctx, x) => {
    if (x && typeof x === 'object' && Object.hasOwn(x, locale)) {
      const keys = Object.keys(x)
      if (keys.every((key) => locales.includes(key))) {
        ctx.update(x[locale])
      }
    }
  })
}
