export type BilingualLanguage = 'en' | 'de' | undefined

export const DEFAULT_LOCALE: BilingualLanguage = 'en'

export const eventName = 'localeChange' as const

export const generateFieldId = (path: string) => `field-${path.replace(/\./g, '__')}`

export const generatePreferenceKey = (path: string) => `${path.replace(/\./g, ':')}:locale`
