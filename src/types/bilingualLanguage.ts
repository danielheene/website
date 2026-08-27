export const BilingualLanguage = {
  German: 'de',
  English: 'en',
} as const

export type BilingualLanguage = typeof BilingualLanguage
export type BilingualLanguageKey = keyof BilingualLanguage
export type BilingualLanguageValue = BilingualLanguage[BilingualLanguageKey]

export const BilingualLanguageLabel = {
  [BilingualLanguage.English]: 'English',
  [BilingualLanguage.German]: 'German',
} as const

export type BilingualLanguageLabel = typeof BilingualLanguageLabel
export type BilingualLanguageLabelKey = keyof BilingualLanguageLabel
export type BilingualLanguageLabelValue = BilingualLanguageLabel[BilingualLanguageLabelKey]
