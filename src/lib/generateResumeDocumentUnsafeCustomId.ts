import { customAlphabet } from 'nanoid'

/**
 * Generates a random 10-character uppercase alphanumeric ID without checking
 * for collisions against existing ResumeDocuments.
 *
 * Deliberately kept free of any `@payload-config` import: it's used at module
 * scope in `globals/PDFGeneratorSettings/index.ts`, and importing the Payload
 * config there would create a circular import (config -> globals -> this file
 * -> config -> ...), which surfaces as a "Cannot access '<var>' before
 * initialization" error during production builds.
 */
export const generateResumeDocumentUnsafeCustomId = () => {
  return customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ')(10)
}
