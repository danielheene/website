import { get } from 'lodash-es'

export const LANGUAGE_CODES = {
  DE: 'DE',
  EN: 'EN',
  FR: 'FR',
  IT: 'IT',
  ES: 'ES',
  PT: 'PT',
  PL: 'PL',
  RU: 'RU',
  ZH: 'ZH',
} as const

export const LANGUAGE_NAME = {
  EN: {
    [LANGUAGE_CODES.DE]: 'German',
    [LANGUAGE_CODES.EN]: 'English',
    [LANGUAGE_CODES.FR]: 'French',
    [LANGUAGE_CODES.IT]: 'Italian',
    [LANGUAGE_CODES.ES]: 'Spanish',
    [LANGUAGE_CODES.PT]: 'Portuguese',
    [LANGUAGE_CODES.PL]: 'Polish',
    [LANGUAGE_CODES.RU]: 'Russian',
    [LANGUAGE_CODES.ZH]: 'Chinese',
  },
  DE: {
    [LANGUAGE_CODES.DE]: 'Deutsch',
    [LANGUAGE_CODES.EN]: 'Englisch',
    [LANGUAGE_CODES.FR]: 'Französisch',
    [LANGUAGE_CODES.IT]: 'Italienisch',
    [LANGUAGE_CODES.ES]: 'Spanisch',
    [LANGUAGE_CODES.PT]: 'Portugiesisch',
    [LANGUAGE_CODES.PL]: 'Polnisch',
    [LANGUAGE_CODES.RU]: 'Russisch',
    [LANGUAGE_CODES.ZH]: 'Chinesisch',
  },
} as const

export type LanguageCode = (typeof LANGUAGE_CODES)[keyof typeof LANGUAGE_CODES]

export const getLanguageName = (
  code: LanguageCode | string,
  locale: 'en' | 'de' | string = 'en',
): string => {
  return get(
    LANGUAGE_NAME,
    [
      locale.toUpperCase(),
      code.toUpperCase(),
    ],
    `${code}`,
  )
}
