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

  it('renders exactly one anchor when icons are set, with no separate wrapper element', () => {
    // Regression guard for the Button/CMSLink split: iconBefore/iconAfter
    // used to be rendered by CMSLink itself, inside the <Link>'s children.
    // They now pass through to Button's startIcon/endIcon and rely on
    // Slot/Slottable to end up as children of the same anchor — asserting
    // there is still exactly one link element (not the icon's element
    // sitting outside it) catches a regression to that merge without
    // depending on Iconify's async icon data loading in tests.
    render(
      <CMSLink
        iconBefore="arrow-left"
        iconAfter="arrow-right"
        text="Visit example"
        linkType="custom"
        doc={null}
        url="https://example.com"
      />,
    )

    expect(
      screen.getAllByRole('link', {
        name: 'Visit example',
      }),
    ).toHaveLength(1)
  })
})
