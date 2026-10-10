import type { Block } from 'payload'

import { FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/shiki'
import { BlockGroup, BlockSlug } from '@/types/blocks'

/**
 * Display labels for `SUPPORTED_LANGUAGES` — Shiki's own bundled-language
 * metadata (`bundledLanguagesInfo`) exists for this, but pulling it in here
 * would drag Shiki's runtime into `payload.config.ts`'s module graph just to
 * build a select list. Hand-written instead, and exhaustively typed
 * (`Record<SupportedLanguage, string>`) so adding a language to
 * `SUPPORTED_LANGUAGES` without a matching label here fails the build rather
 * than silently falling back to the raw id in the admin UI.
 */
const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  bash: 'Bash',
  css: 'CSS',
  diff: 'Diff',
  docker: 'Dockerfile',
  go: 'Go',
  graphql: 'GraphQL',
  html: 'HTML',
  http: 'HTTP',
  ini: 'INI',
  javascript: 'JavaScript',
  json: 'JSON',
  json5: 'JSON5',
  jsonl: 'JSON Lines',
  jsx: 'JSX',
  markdown: 'Markdown',
  mdx: 'MDX',
  nginx: 'Nginx',
  shellscript: 'Shell Script',
  shellsession: 'Shell Session',
  sql: 'SQL',
  'ssh-config': 'SSH Config',
  systemd: 'Systemd Unit',
  toml: 'TOML',
  tsx: 'TSX',
  typescript: 'TypeScript',
  xml: 'XML',
  yaml: 'YAML',
}

export const CodeBlock: Block = {
  slug: BlockSlug.Code,
  interfaceName: BlockSlug.Code,
  labels: {
    singular: 'Code Block',
    plural: 'Code Block',
  },
  admin: {
    group: BlockGroup.General,
    disableBlockName: true,
    images: {
      thumbnail: '/payload/blocks/general-code-thumbnail.svg',
      icon: '/payload/blocks/general-code-icon.svg',
    },
  },
  fields: [
    {
      name: 'language',
      type: 'select',
      defaultValue: FALLBACK_LANGUAGE,
      options: SUPPORTED_LANGUAGES.map((language) => ({
        label: LANGUAGE_LABELS[language],
        value: language,
      })),
    },
    {
      name: 'code',
      type: 'code',
      label: false,
      required: true,
      admin: {
        /**
         * Static default language for first paint
         *
         * `CodeFieldComponent` overrides this per-field, from the
         * sibling `language` select.
         */
        language: FALLBACK_LANGUAGE,
        components: {
          Field: {
            path: '@/blocks/CodeBlock/CodeFieldComponent',
            exportName: 'CodeFieldComponent',
          },
        },
        editorOptions: {
          fontSize: 16,
          fontFamily: 'var(--font-mono)',
          /**
           * Match Payload's height formula
           *
           * Payload sizes the editor from `lines * 18 + padding`.
           * `wordWrap: 'off'` keeps one logical line = one visual line;
           * `ignoreHorizontalScrollbarInContentHeight` keeps the overflow
           * scrollbar from pushing content past that computed height.
           */
          lineHeight: 18,
          padding: {
            top: 12,
            bottom: 12,
          },
          wordWrap: 'off',
          scrollbar: {
            alwaysConsumeMouseWheel: false,
            ignoreHorizontalScrollbarInContentHeight: true,
          },
        },
        editorProps: {},
      },
    },
  ],
}
