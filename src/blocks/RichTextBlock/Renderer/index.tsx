import type { JSX } from 'react'

import { cn } from 'tailwind-variants'

import RichText from '@/components/RichText'
import { highlightRichText } from '@/lib/shiki/highlightRichText'
import type { RichTextBlock } from '@/types/payload'

type RichTextBlockRendererProps = {
  className?: string
} & RichTextBlock

/**
 * Server Component so code blocks can be highlighted before `RichText` — a
 * Client Component — renders them.
 */
export const RichTextBlockRenderer = async ({
  className,
  content,
}: RichTextBlockRendererProps): Promise<JSX.Element> => (
  <div className={cn(className)}>
    <RichText
      data={content}
      enableGutter={false}
      highlightedCode={await highlightRichText(content)}
    />
  </div>
)
