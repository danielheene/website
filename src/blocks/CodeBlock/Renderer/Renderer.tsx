import type { JSX } from 'react'

import { cn } from '@/lib/cn'
import { highlightCode } from '@/lib/shiki'
import type { CodeBlock } from '@/types/payload'

import { CopyButton } from './CopyButton'

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

  const html = await highlightCode({
    code,
    language: language ?? undefined,
  })

  return (
    <div
      className={cn([
        'not-prose group/code relative rounded-md border border-border',
        className,
      ])}
    >
      <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover/code:opacity-100 focus-within:opacity-100">
        <CopyButton code={code} />
      </div>

      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is generated server-side from stored code, not user-supplied HTML */}
      <div
        className="shiki-container overflow-x-auto text-sm"
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    </div>
  )
}
