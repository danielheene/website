import type { JSX } from 'react'

import { cn } from 'tailwind-variants'

import RichText from '@/components/RichText'
import type { HighlightedCodeMap } from '@/lib/shiki/codeBlockKey'
import type { RichTextBlock } from '@/types/payload'

type ColumnsProps = {
  className?: string
  verticalAlignment?: 'start' | 'center' | 'end'
  orderMobile?: 'normal' | 'reversed'
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
  orderMobile = 'normal',
  contentLeft,
  contentRight,
  highlightedLeft,
  highlightedRight,
}: ColumnsProps): JSX.Element => (
  <div
    className={cn(
      'grid grid-cols-1 gap-x-8 md:grid-cols-2',
      verticalAlignment === 'start' && 'items-start',
      verticalAlignment === 'center' && 'items-center',
      verticalAlignment === 'end' && 'items-end',
      orderMobile === 'normal' &&
        '[&>div:nth-child(1)]:order-first md:[&>div:nth-child(1)]:order-first',
      orderMobile === 'reversed' &&
        '[&>div:nth-child(2)]:order-first md:[&>div:nth-child(2)]:order-last',
      className,
    )}
  >
    <RichText data={contentLeft} enableGutter={false} highlightedCode={highlightedLeft} />
    <RichText data={contentRight} enableGutter={false} highlightedCode={highlightedRight} />
  </div>
)
