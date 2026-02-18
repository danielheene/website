import { RenderComponentClient } from './RenderComponent.client'

export type CodeBlockProps = {
  code: string
  language?: string
  blockType: 'code'
}

type CodeBlockRendererProps = CodeBlockProps & {
  className?: string
}

export const CodeBlockRenderer = ({ className, code, language }: CodeBlockRendererProps) => {
  return (
    <div className={[className, 'not-prose'].filter(Boolean).join(' ')}>
      <RenderComponentClient code={code} language={language} />
    </div>
  )
}
