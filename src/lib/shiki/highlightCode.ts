import type { BundledLanguage, Highlighter } from 'shiki'
import { createHighlighter } from 'shiki'

/**
 * Languages offered by the Code block field, plus the fallbacks the Lexical
 * code node can produce. Loading a fixed set keeps the bundle predictable —
 * Shiki's full grammar collection is an order of magnitude larger.
 */
export const SUPPORTED_LANGUAGES = [
  'bash',
  'css',
  'diff',
  'docker',
  'go',
  'graphql',
  'html',
  'http',
  'ini',
  'javascript',
  'json',
  'json5',
  'jsonl',
  'jsx',
  'markdown',
  'mdx',
  'nginx',
  'shellscript',
  'shellsession',
  'sql',
  'ssh-config',
  'systemd',
  'toml',
  'tsx',
  'typescript',
  'xml',
  'yaml',
] as const satisfies readonly BundledLanguage[]

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

/**
 * Both themes are loaded so a single highlight pass can emit CSS variables for
 * each, letting the site's theme toggle switch instantly without re-running
 * Shiki in the browser.
 */
const THEMES = {
  light: 'github-light',
  dark: 'github-dark',
} as const

export const FALLBACK_LANGUAGE: SupportedLanguage = 'typescript'

/**
 * Creating a highlighter loads the regex engine and grammars, which is far too
 * expensive to repeat per render. The promise is cached so concurrent callers
 * share one instance.
 */
let highlighterPromise: Promise<Highlighter> | null = null

const getHighlighter = (): Promise<Highlighter> => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: Object.values(THEMES),
      langs: [
        ...SUPPORTED_LANGUAGES,
      ],
    })
  }
  return highlighterPromise
}

const isSupported = (language: string): language is SupportedLanguage =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(language)

export interface HighlightCodeOptions {
  code: string
  language?: string
}

/**
 * Renders code to themed HTML on the server.
 *
 * Unknown languages fall back rather than throwing: the field's options can
 * change independently of the grammars loaded here, and a mismatch should
 * degrade to plain formatting instead of breaking the page.
 *
 * Shiki's tokenizer reads `Date.now()` internally for its grammar timeout
 * guard, which Cache Components rejects during an uncached prerender — server
 * callers must go through `highlightCodeCached` rather than calling this
 * directly.
 */
export const highlightCode = async ({
  code,
  language = FALLBACK_LANGUAGE,
}: HighlightCodeOptions): Promise<string> => {
  const highlighter = await getHighlighter()
  const resolvedLanguage = isSupported(language) ? language : FALLBACK_LANGUAGE

  return highlighter.codeToHtml(code, {
    lang: resolvedLanguage,
    themes: THEMES,
    // emits `--shiki-light` / `--shiki-dark` custom properties per token
    defaultColor: false,
    colorReplacements: {},
  })
}
