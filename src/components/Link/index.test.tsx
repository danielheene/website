// src/components/Link/index.test.tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CMSLink } from './index'

describe('CMSLink', () => {
  it('renders the text directly, with no resolvedLabel fallback', () => {
    render(<CMSLink text="Visit example" linkType="custom" doc={null} url="https://example.com" />)

    expect(screen.getByText('Visit example')).toBeInTheDocument()
  })

  it('uses text as the aria-label when icon only is set', () => {
    render(
      <CMSLink
        iconBefore="arrow-right"
        iconOnly
        text="Visit example"
        linkType="custom"
        doc={null}
        url="https://example.com"
      />,
    )

    expect(
      screen.getByRole('link', {
        name: 'Visit example',
      }),
    ).toBeInTheDocument()
  })
})
