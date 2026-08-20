import type React from 'react'
import { render } from 'react-email'

export type RenderedEmail = {
  html: string
  text: string
}

/**
 * Renders a React Email template to the `html` and `text` bodies
 * `payload.sendEmail` expects, so callers don't have to invoke
 * `render` from `react-email` twice.
 */
export const renderEmail = async (element: React.ReactElement): Promise<RenderedEmail> => {
  const [html, text] = await Promise.all([
    render(element),
    render(element, {
      plainText: true,
    }),
  ])

  return {
    html,
    text,
  }
}
