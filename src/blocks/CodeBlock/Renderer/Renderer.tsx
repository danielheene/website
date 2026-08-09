import type { JSX } from 'react'

import { highlightCodeCached } from '@/lib/shiki/highlightCodeCached'
import type { CodeBlock } from '@/types/payload'

import { CodeBlockShell } from './CodeBlockShell'

type CodeBlockRendererProps = {
  className?: string
} & CodeBlock

/**
 * Server-rendered code block.
 *
 * Highlighting runs during SSR rather than after hydration, so the block is
 * fully styled in the initial HTML — no flash of unstyled code, and no
 * highlighter shipped to the browser. Only the copy button is client-side.
 *
 * Shiki emits `--shiki-light` / `--shiki-dark` custom properties per token;
 * `frontend.css` selects between them, so the theme toggle applies instantly
 * without re-highlighting.
 */
export const CodeBlockRenderer = async ({
  className,
  code,
  language,
}: CodeBlockRendererProps): Promise<JSX.Element | null> => {
  if (!code) return null

  const html = await highlightCodeCached({
    code,
    language: language ?? undefined,
  })

  return <CodeBlockShell className={className} code={code} html={html} />
}
