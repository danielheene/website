import type { JSX } from 'react'

import { highlightRichText } from '@website/lib/shiki/highlightRichText'
import type { RichTextBlock } from '@website/types/payload'
import { cn } from 'tailwind-variants'

import RichText from '@/components/RichText'

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
