/**
 * Enumeration of supported language codes using ISO 639-1 two-letter language identifiers.
 * This constant object provides a type-safe mapping of language codes to their string representations.
 *
 * @readonly
 * @type {{readonly CS: 'cs', readonly DA: 'da', readonly DE: 'de', readonly EN: 'en', readonly ES: 'es', readonly ET: 'et', readonly FI: 'fi', readonly FR: 'fr', readonly HU: 'hu', readonly JA: 'ja', readonly LV: 'lv', readonly LT: 'lt', readonly NO: 'no', readonly IT: 'it', readonly NL: 'nl', readonly PL: 'pl', readonly PT: 'pt', readonly RO: 'ro', readonly RU: 'ru', readonly SK: 'sk', readonly SL: 'sl', readonly SV: 'sv', readonly UK: 'uk', readonly ZH: 'zh'}}
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
 *
 * @readonly
 * @type {{readonly A1: 'a1', readonly A2: 'a2', readonly B1: 'b1', readonly B2: 'b2', readonly C1: 'c1', readonly C2: 'c2'}}
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
 *
 * @readonly
 * @type {{readonly PROGRAMMING_LANGUAGES: 'programmingLanguages', readonly FRAMEWORKS_AND_LIBRARIES: 'frameworksAndLibraries', readonly TOOLING_AND_PLATFORMS: 'toolingAndPlatforms', readonly TESTING_AND_QUALITY: 'testingAndQuality', readonly ARCHITECTURE_AND_PATTERNS: 'architectureAndPatterns', readonly METHODOLOGIES_AND_WORKING_PRACTICES: 'methodologiesAndWorkingPractices'}}
 */
export const SKILL_TYPE = {
  PROGRAMMING_LANGUAGES: 'programmingLanguages',
  FRAMEWORKS_AND_LIBRARIES: 'frameworksAndLibraries',
  TOOLING_AND_PLATFORMS: 'toolingAndPlatforms',
  TESTING_AND_QUALITY: 'testingAndQuality',
  ARCHITECTURE_AND_PATTERNS: 'architectureAndPatterns',
  METHODOLOGIES_AND_WORKING_PRACTICES: 'methodologiesAndWorkingPractices',
} as const
