import type { JSX } from 'react'

import { cn } from 'tailwind-variants'

import RichText from '@/components/RichText'
import type { HighlightedCodeMap } from '@/lib/shiki/codeBlockKey'
import type { RichTextBlock } from '@/types/payload'

/**
 * Payload generates no interface for a block that only Lexical references, so
 * the columns are typed as the rich-text value they hold.
 */
const ALIGN_CLASS: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
}

type ColumnsProps = {
  className?: string
  verticalAlignment?: 'start' | 'center' | 'end'
  contentLeft?: RichTextBlock['content']
  contentRight?: RichTextBlock['content']
  highlightedLeft?: HighlightedCodeMap
  highlightedRight?: HighlightedCodeMap
}

/**
 * Two-column layout for the Lexical-only Two-Column block.
 *
 * Synchronous and free of server-only imports: it renders as a `RichText`
 * block converter, which runs on the client, where `async` components cannot
 * render.
 */
export const Columns = ({
  className,
  verticalAlignment = 'start',
  contentLeft,
  contentRight,
  highlightedLeft,
  highlightedRight,
}: ColumnsProps): JSX.Element => (
  <div
    className={cn(
      'grid grid-cols-1 gap-x-8 md:grid-cols-2',
      ALIGN_CLASS[verticalAlignment] ?? 'items-start',
      className,
    )}
  >
    <RichText data={contentLeft} enableGutter={false} highlightedCode={highlightedLeft} />
    <RichText data={contentRight} enableGutter={false} highlightedCode={highlightedRight} />
  </div>
)
