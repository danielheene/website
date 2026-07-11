import type { FieldHook } from 'payload'

export const createFallbackToSiblingLocale = (
  locale: 'en' | 'de',
): FieldHook => {
  return async ({ siblingData, value }) => {
    const siblingHasValue =
      locale in siblingData &&
      typeof siblingData[locale] === 'string' &&
      siblingData[locale].trim() !== ''

    const valueIsMissing = !value || value.trim() === ''

    if (valueIsMissing && siblingHasValue) return siblingData[locale]
    return value
  }
}
