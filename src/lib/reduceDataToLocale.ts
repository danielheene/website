import { Traverse } from 'neotraverse/modern'

type Locale = 'en' | 'de'

/**
 * Recursive type that selects the localized value from objects containing only locale keys.
 */
export type DeepReduced<T, L extends Locale = 'en'> = T extends null | undefined
  ? T
  : T extends Array<infer V>
    ? Array<DeepReduced<V, L>>
    : T extends object
      ? L extends keyof T
        ? keyof T extends Locale
          ? DeepReduced<T[L], L>
          : { [K in keyof T]: DeepReduced<T[K], L> }
        : { [K in keyof T]: DeepReduced<T[K], L> }
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
export const reduceDataToLocale = <T, L extends Locale = 'en'>(data: T, locale: L = 'en' as L): DeepReduced<T, L> => {
  const locales: string[] = ['en', 'de']
  return new Traverse(data).forEach((ctx, x) => {
    if (x && typeof x === 'object' && Object.hasOwn(x, locale)) {
      const keys = Object.keys(x)
      if (keys.every((key) => locales.includes(key))) {
        ctx.update(x[locale])
      }
    }
  })
}
