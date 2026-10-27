import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * The family name this package registers under (the CSS `font-family` and the
 * `family` field of the PDF registration).
 */
export const family = 'PP Frama'

/**
 * The CSS custom property that carries this family into the document.
 */
export const variable = '--pp-frama'

/**
 * The font files this package ships, with their weight and style.
 *
 * `file` is relative to the package's `files/` directory; `resolveFile`
 * turns it into an absolute path on disk.
 */
export const files = [
  { file: 'pp-frama-100-italic.woff2', weight: '100', style: 'italic' },
  { file: 'pp-frama-100-normal.woff2', weight: '100', style: 'normal' },
  { file: 'pp-frama-200-italic.woff2', weight: '200', style: 'italic' },
  { file: 'pp-frama-200-normal.woff2', weight: '200', style: 'normal' },
  { file: 'pp-frama-300-italic.woff2', weight: '300', style: 'italic' },
  { file: 'pp-frama-300-normal.woff2', weight: '300', style: 'normal' },
  { file: 'pp-frama-400-italic.woff2', weight: '400', style: 'italic' },
  { file: 'pp-frama-400-normal.woff2', weight: '400', style: 'normal' },
  { file: 'pp-frama-500-italic.woff2', weight: '500', style: 'italic' },
  { file: 'pp-frama-500-normal.woff2', weight: '500', style: 'normal' },
  { file: 'pp-frama-700-italic.woff2', weight: '700', style: 'italic' },
  { file: 'pp-frama-700-normal.woff2', weight: '700', style: 'normal' },
  { file: 'pp-frama-900-italic.woff2', weight: '900', style: 'italic' },
  { file: 'pp-frama-900-normal.woff2', weight: '900', style: 'normal' },
] as const

export type FontFile = (typeof files)[number]

/**
 * Resolves the absolute path of a shipped font file.
 */
export const resolveFile = (file: string): string => path.join(dirname, './files', file)

export default { family, variable, files, resolveFile }
