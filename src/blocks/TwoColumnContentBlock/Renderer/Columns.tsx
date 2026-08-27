import type { JSX } from 'react'

import { cn } from 'tailwind-variants'

import RichText from '@/components/RichText'
import type { HighlightedCodeMap } from '@/lib/shiki/codeBlockKey'
import type { TwoColumnContentBlock } from '@/types/payload'

/**
 * Only the fields actually rendered, rather than the full block type — the
 * `RichText` converter receives `node.fields`, which omits `blockType`.
 */
type ColumnsProps = {
  className?: string
  highlightedLeft?: HighlightedCodeMap
  highlightedRight?: HighlightedCodeMap
} & Pick<TwoColumnContentBlock, 'contentLeft' | 'contentRight'>

/**
 * Presentational two-column layout.
 *
 * Synchronous and free of server-only imports, so it can be used both by the
 * async Server Component wrapper and as a `RichText` block converter — the
 * latter runs on the client, where `async` components cannot render.
 */
export const Columns = ({
  className,
  contentLeft,
  contentRight,
  highlightedLeft,
  highlightedRight,
}: ColumnsProps): JSX.Element => (
  <div className={cn('grid', className)}>
    <div className={cn('col-span-12 md:col-span-6')}>
      <RichText data={contentLeft} enableGutter={false} highlightedCode={highlightedLeft} />
    </div>
    <div className={cn('col-span-12 md:col-span-6')}>
      <RichText data={contentRight} enableGutter={false} highlightedCode={highlightedRight} />
    </div>
  </div>
)
