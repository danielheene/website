import { get } from 'lodash-es'

export const PROFICIENCY_LEVEL = {
  A1: 'A1',
  A2: 'A2',
  B1: 'B1',
  B2: 'B2',
  C1: 'C1',
  C2: 'C2',
} as const

export const PROFICENCY_LABEL = {
  EN: {
    [PROFICIENCY_LEVEL.A1]: 'Beginner',
    [PROFICIENCY_LEVEL.A2]: 'Elementary',
    [PROFICIENCY_LEVEL.B1]: 'Intermediate',
    [PROFICIENCY_LEVEL.B2]: 'Upper-Intermediate',
    [PROFICIENCY_LEVEL.C1]: 'Advanced',
    [PROFICIENCY_LEVEL.C2]: 'Proficient',
  },
  DE: {
    [PROFICIENCY_LEVEL.A1]: 'Anfänger',
    [PROFICIENCY_LEVEL.A2]: 'Grundkenntnisse',
    [PROFICIENCY_LEVEL.B1]: 'Gute Kenntnisse',
    [PROFICIENCY_LEVEL.B2]: 'Fließend',
    [PROFICIENCY_LEVEL.C1]: 'Verhandlungssicher',
    [PROFICIENCY_LEVEL.C2]: 'Muttersprache',
  },
} as const

export type LanguageProficiency = (typeof PROFICIENCY_LEVEL)[keyof typeof PROFICIENCY_LEVEL]

export const getProficiencyLabel = (level: LanguageProficiency | string, locale: 'en' | 'de' | string = 'en') => {
  return get(PROFICENCY_LABEL, [locale.toUpperCase(), level.toUpperCase()], `${level}`)
}
