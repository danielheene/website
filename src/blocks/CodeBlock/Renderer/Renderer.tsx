import { cn } from '@/lib/cn'
import type { CodeBlock } from '@/types/payload'

import { CodeBlockRendererClient } from './Renderer.client'

type CodeBlockRendererProps = {
  className?: string
} & CodeBlock

export const CodeBlockRenderer = ({
  className,
  code,
  language,
  blockType,
}: CodeBlockRendererProps) => {
  return (
    <div className={cn('not-prose', className, 'rounded-md')}>
      <CodeBlockRendererClient code={code} language={language} />
    </div>
  )
}
