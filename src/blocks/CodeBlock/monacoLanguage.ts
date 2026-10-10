import type { SupportedLanguage } from '@/lib/shiki'

/**
 * Map Shiki language ids to Monaco's own ids
 *
 * Several ids differ (e.g. `bash` → `shell`). Monaco has no grammar for
 * `diff`, `http`, `nginx`, `ssh-config`, `systemd` — those fall back to
 * `plaintext` or the closest built-in.
 */
const MONACO_LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  bash: 'shell',
  css: 'css',
  diff: 'plaintext',
  docker: 'dockerfile',
  go: 'go',
  graphql: 'graphql',
  html: 'html',
  http: 'plaintext',
  ini: 'ini',
  javascript: 'javascript',
  json: 'json',
  json5: 'json',
  jsonl: 'json',
  jsx: 'javascript',
  markdown: 'markdown',
  mdx: 'mdx',
  nginx: 'plaintext',
  shellscript: 'shell',
  shellsession: 'shell',
  sql: 'sql',
  'ssh-config': 'plaintext',
  systemd: 'plaintext',
  toml: 'ini',
  tsx: 'typescript',
  typescript: 'typescript',
  xml: 'xml',
  yaml: 'yaml',
}

export const toMonacoLanguage = (language: SupportedLanguage): string =>
  MONACO_LANGUAGE_MAP[language]
