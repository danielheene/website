import type { CodeBlock } from '@payload-types'

import { cn } from '@/utilities/cn'

import { CodeBlockRendererClient } from './Renderer.client'

type CodeBlockRendererProps = {
  className?: string
} & CodeBlock

export const CodeBlockRenderer = ({ className, code, language }: CodeBlockRendererProps) => {
  return (
    <div className={cn('not-prose', className, 'rounded-md')}>
      <CodeBlockRendererClient code={code} language={language} />
    </div>
  )
}
