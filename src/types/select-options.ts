/**
 * Enumeration of supported language codes using ISO 639-1 two-letter language identifiers.
 * This constant object provides a type-safe mapping of language codes to their string representations.
 *
 * Each property represents a specific language:
 * - cs: Czech
 * - da: Danish
 * - de: German
 * - en: English
 * - es: Spanish
 * - et: Estonian
 * - fi: Finnish
 * - fr: French
 * - hu: Hungarian
 * - ja: Japanese
 * - lv: Latvian
 * - lt: Lithuanian
 * - no: Norwegian
 * - it: Italian
 * - nl: Dutch
 * - pl: Polish
 * - pt: Portuguese
 * - ro: Romanian
 * - ru: Russian
 * - sk: Slovak
 * - sl: Slovenian
 * - sv: Swedish
 * - uk: Ukrainian
 * - zh: Chinese
 *
 * The object is marked as readonly (const assertion) to ensure immutability and enable
 * proper TypeScript type inference for literal string values.
 *
 * @constant
 * @readonly
 * @type {{readonly cs: 'cs', readonly da: 'da', readonly de: 'de', readonly en: 'en', readonly es: 'es', readonly et: 'et', readonly fi: 'fi', readonly fr: 'fr', readonly hu: 'hu', readonly ja: 'ja', readonly lv: 'lv', readonly lt: 'lt', readonly no: 'no', readonly it: 'it', readonly nl: 'nl', readonly pl: 'pl', readonly pt: 'pt', readonly ro: 'ro', readonly ru: 'ru', readonly sk: 'sk', readonly sl: 'sl', readonly sv: 'sv', readonly uk: 'uk', readonly zh: 'zh'}}
 */
export const LANGUAGE_CODE = {
  cs: 'cs',
  da: 'da',
  de: 'de',
  en: 'en',
  es: 'es',
  et: 'et',
  fi: 'fi',
  fr: 'fr',
  hu: 'hu',
  ja: 'ja',
  lv: 'lv',
  lt: 'lt',
  no: 'no',
  it: 'it',
  nl: 'nl',
  pl: 'pl',
  pt: 'pt',
  ro: 'ro',
  ru: 'ru',
  sk: 'sk',
  sl: 'sl',
  sv: 'sv',
  uk: 'uk',
  zh: 'zh',
} as const

/**
 * Common European Framework of Reference for Languages (CEFR) proficiency levels.
 * Defines standardized language proficiency classifications ranging from beginner (A1) to mastery (C2).
 *
 * A1: Beginner - Can understand and use basic expressions and simple phrases
 * A2: Elementary - Can communicate in simple routine tasks requiring basic information exchange
 * B1: Intermediate - Can handle most travel situations and describe experiences and events
 * B2: Upper Intermediate - Can interact with native speakers fluently and produce detailed text
 * C1: Advanced - Can express ideas fluently and use language flexibly for social, academic, and professional purposes
 * C2: Proficiency - Can understand virtually everything and express oneself spontaneously and precisely
 *
 * @readonly
 * @enum {string}
 */
export const LANGUAGE_PROFICIENCY = {
  a1: 'a1',
  a2: 'a2',
  b1: 'b1',
  b2: 'b2',
  c1: 'c1',
  c2: 'c2',
} as const

/**
 * Enumeration of skill type categories used to classify technical skills and competencies.
 *
 * This constant object defines the available skill type classifications that can be used
 * throughout the application to categorize different types of technical abilities and
 * expertise areas. Each property maps to a string identifier representing a distinct
 * category of professional skills.
 *
 * The skill types cover major areas of software development expertise including:
 * - Programming language proficiency
 * - Framework and library knowledge
 * - Development tools and platform experience
 * - Testing and quality assurance capabilities
 * - Architectural design and pattern understanding
 * - Development methodologies and collaborative practices
 *
 * @constant
 * @readonly
 * @type {{
 *   programmingLanguages: 'programmingLanguages',
 *   frameworksAndLibraries: 'frameworksAndLibraries',
 *   toolingAndPlatforms: 'toolingAndPlatforms',
 *   testingAndQuality: 'testingAndQuality',
 *   architectureAndPatterns: 'architectureAndPatterns',
 *   methodologiesAndWorkingPractices: 'methodologiesAndWorkingPractices'
 * }}
 */
export const SKILL_TYPE = {
  programmingLanguages: 'programmingLanguages',
  frameworksAndLibraries: 'frameworksAndLibraries',
  toolingAndPlatforms: 'toolingAndPlatforms',
  testingAndQuality: 'testingAndQuality',
  architectureAndPatterns: 'architectureAndPatterns',
  methodologiesAndWorkingPractices: 'methodologiesAndWorkingPractices',
} as const
