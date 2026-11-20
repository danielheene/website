import { useEffect, useState, type ReactElement } from 'react'
import { render } from 'react-email'

type EmailPreviewProps = {
  email: ReactElement
  /** The HTML body, or the plain-text body sent alongside it. */
  format?: 'html' | 'text'
  /** Viewport width the email is laid out at, in px. */
  width?: number
}

/**
 * Renders an email the way it is sent (`renderEmail` in `src/emails/render.ts`)
 * and shows it in an iframe, so neither the email's inline styles nor
 * Storybook's theme leak into the other.
 */
export const EmailPreview = ({ email, format = 'html', width = 640 }: EmailPreviewProps) => {
  const [output, setOutput] = useState<string | null>(null)
  const [height, setHeight] = useState(600)

  useEffect(() => {
    let current = true

    const rendering = format === 'text' ? render(email, { plainText: true }) : render(email)

    void rendering.then((rendered) => {
      if (current) setOutput(rendered)
    })

    return () => {
      current = false
    }
  }, [email, format])

  if (output === null) return <p>Rendering…</p>

  if (format === 'text') {
    return (
      <pre className="max-w-[640px] font-mono text-sm whitespace-pre-wrap" style={{ width }}>
        {output}
      </pre>
    )
  }

  return (
    <iframe
      title="Email preview"
      srcDoc={output}
      // same origin so the height can be read; emails carry no scripts to allow
      sandbox="allow-same-origin allow-popups"
      style={{ width, height, border: 0, background: 'white' }}
      onLoad={({ currentTarget }) => {
        const body = currentTarget.contentDocument?.documentElement

        if (body) setHeight(body.scrollHeight)
      }}
    />
  )
}
