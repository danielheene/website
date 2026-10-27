import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * The family name this package registers under (the CSS `font-family` and the
 * `family` field of the PDF registration).
 */
export const family = 'PP Frama Text'

/**
 * The CSS custom property that carries this family into the document.
 */
export const variable = '--pp-frama-text'

/**
 * The font files this package ships, with their weight and style.
 *
 * `file` is relative to the package's `files/` directory; `resolveFile`
 * turns it into an absolute path on disk.
 */
export const files = [
  { file: 'pp-frama-text-300-italic.woff2', weight: '300', style: 'italic' },
  { file: 'pp-frama-text-300-normal.woff2', weight: '300', style: 'normal' },
  { file: 'pp-frama-text-400-italic.woff2', weight: '400', style: 'italic' },
  { file: 'pp-frama-text-400-normal.woff2', weight: '400', style: 'normal' },
  { file: 'pp-frama-text-700-italic.woff2', weight: '700', style: 'italic' },
  { file: 'pp-frama-text-700-normal.woff2', weight: '700', style: 'normal' },
] as const

export type FontFile = (typeof files)[number]

/**
 * Resolves the absolute path of a shipped font file.
 */
export const resolveFile = (file: string): string => path.join(dirname, './files', file)

export default { family, variable, files, resolveFile }
