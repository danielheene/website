import type { JSX } from 'react'

import { cn } from 'tailwind-variants'

import RichText from '@/components/RichText'
import type { HighlightedCodeMap } from '@/lib/shiki/codeBlockKey'
import type { HighlightBoxBlock as HighlightBoxBlockData } from '@/types/payload'

/**
 * Only the fields actually rendered, rather than the full block type — the
 * `RichText` converter receives `node.fields`, which omits `blockType`.
 */
type HighlightBoxProps = {
  className?: string
  highlightedCode?: HighlightedCodeMap
} & Pick<HighlightBoxBlockData, 'content'>

/**
 * Presentational bg-colored box. Synchronous and free of server-only
 * imports, so it can be used both by an async Server Component wrapper and
 * as a `RichText` block converter — the latter runs on the client, where
 * `async` components cannot render.
 */
export const HighlightBox = ({
  className,
  content,
  highlightedCode,
}: HighlightBoxProps): JSX.Element => (
  <div
    className={cn([
      'rounded-lg border-l-4 border-primary bg-muted p-4',
      className,
    ])}
  >
    <RichText data={content} enableGutter={false} highlightedCode={highlightedCode} />
  </div>
)
