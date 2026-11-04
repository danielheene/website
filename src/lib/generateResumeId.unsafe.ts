import { customAlphabet } from 'nanoid'

// 5-letter A-Z alphabet: short enough to type from a printed resume; ~488 IDs
// for 1% collision risk (https://zelark.github.io/nano-id-cc/), so callers
// validate uniqueness.
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)

/**
 * Generate a resume ID without a uniqueness check
 *
 * For temporary display IDs in the admin dashboard only; may collide. Kept in
 * its own module, free of `@payload-config`, because `PDFGeneratorSettings`
 * calls this at module-evaluation time — importing the database-backed
 * `generateResumeId` module there would pull in the Payload config, which
 * imports `PDFGeneratorSettings` itself, crashing with a TDZ error.
 */
export const UNSAFE_generateResumeId = () => {
  return nanoid()
}
