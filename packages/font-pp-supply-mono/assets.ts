import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * The family name this package registers under (the CSS `font-family` and the
 * `family` field of the PDF registration).
 */
export const family = 'PP Supply Mono'

/**
 * The CSS custom property that carries this family into the document.
 */
export const variable = '--pp-supply-mono'

/**
 * The font files this package ships, with their weight and style.
 *
 * `file` is relative to the package's `files/` directory; `resolveFile`
 * turns it into an absolute path on disk.
 */
export const files = [
  { file: 'pp-supply-mono-200.woff2', weight: '200', style: 'normal' },
  { file: 'pp-supply-mono-400.woff2', weight: '400', style: 'normal' },
  { file: 'pp-supply-mono-500.woff2', weight: '500', style: 'normal' },
  { file: 'pp-supply-mono-700.woff2', weight: '700', style: 'normal' },
] as const

export type FontFile = (typeof files)[number]

/**
 * Resolves the absolute path of a shipped font file.
 */
export const resolveFile = (file: string): string => path.join(dirname, './files', file)

export default { family, variable, files, resolveFile }
