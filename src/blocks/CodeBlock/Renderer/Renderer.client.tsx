'use client'

import { useTheme } from 'next-themes'
import { Highlight, themes } from 'prism-react-renderer'

import { CopyButton } from './CopyButton'

type CodeBlockRendererClientProps = {
  code: string
  language?: string
}

export const CodeBlockRendererClient = ({ code, language = '' }: CodeBlockRendererClientProps) => {
  const { resolvedTheme } = useTheme() // Ensure the theme is loaded before rendering the code block
  const theme = resolvedTheme === 'dark' ? themes.oneDark : themes.oneLight

  if (!code) return null

  return (
    <Highlight code={code} language={language} theme={theme}>
      {({ getLineProps, getTokenProps, tokens }) => (
        <pre className="bg-white dark:bg-black p-4 border text-sm border-border rounded overflow-x-auto">
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ className: 'table-row', line })}>
              <span className="table-cell select-none text-right text-foreground/50">{i + 1}</span>
              <span className="table-cell pl-4">
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </span>
            </div>
          ))}
          <CopyButton code={code} />
        </pre>
      )}
    </Highlight>
  )
}
