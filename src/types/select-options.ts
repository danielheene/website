export const PAGE_LAYOUT = {
  DEFAULT: 'default',
  HOME: 'home',
  RESUME: 'resume',
  LEGAL: 'legal',
} as const

/**
 * Enumeration of supported language codes using ISO 639-1 two-letter language identifiers.
 * This constant object provides a type-safe mapping of language codes to their string representations.
 */
export const LANGUAGE_CODE = {
  CS: 'cs',
  DA: 'da',
  DE: 'de',
  EN: 'en',
  ES: 'es',
  ET: 'et',
  FI: 'fi',
  FR: 'fr',
  HU: 'hu',
  JA: 'ja',
  LV: 'lv',
  LT: 'lt',
  NO: 'no',
  IT: 'it',
  NL: 'nl',
  PL: 'pl',
  PT: 'pt',
  RO: 'ro',
  RU: 'ru',
  SK: 'sk',
  SL: 'sl',
  SV: 'sv',
  UK: 'uk',
  ZH: 'zh',
} as const

/**
 * Common European Framework of Reference for Languages (CEFR) proficiency levels.
 * Defines standardized language proficiency classifications ranging from beginner (A1) to mastery (C2).
 */
export const LANGUAGE_PROFICIENCY = {
  A1: 'a1',
  A2: 'a2',
  B1: 'b1',
  B2: 'b2',
  C1: 'c1',
  C2: 'c2',
} as const

/**
 * Enumeration of skill type categories used to classify technical skills and competencies.
 */
export const SKILL_TYPE = {
  PROGRAMMING_LANGUAGES: 'programmingLanguages',
  FRAMEWORKS_AND_LIBRARIES: 'frameworksAndLibraries',
  TOOLING_AND_PLATFORMS: 'toolingAndPlatforms',
  TESTING_AND_QUALITY: 'testingAndQuality',
  ARCHITECTURE_AND_PATTERNS: 'architectureAndPatterns',
  METHODOLOGIES_AND_WORKING_PRACTICES: 'methodologiesAndWorkingPractices',
} as const
