// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Icon } from './Icon'

describe('Icon', () => {
  // Iconify fetches icon data after mount. Without a sized placeholder the
  // icon takes no space until then and shifts the layout when it appears.
  it('reserves the loaded icon’s 1em svg box, with the caller’s classes, before the data loads', () => {
    const { container } = render(
      <Icon
        name="material-symbols:close"
        className="ml-8 text-xl"
        style={{
          color: 'red',
        }}
      />,
    )

    const placeholder = container.firstElementChild as SVGSVGElement
    expect(placeholder.tagName.toLowerCase()).toBe('svg')
    expect(placeholder.getAttribute('aria-hidden')).toBe('true')
    expect(placeholder.getAttribute('width')).toBe('1em')
    expect(placeholder.getAttribute('height')).toBe('1em')
    expect(placeholder.getAttribute('class')).toBe('ml-8 text-xl')
    expect(placeholder.style.color).toBe('red')
  })

  // Button pads and sizes its icons through `has-data-[icon=…]` and
  // `[&>svg]` selectors, which must match the placeholder as well.
  it('forwards data and aria attributes, but no Iconify props, onto the placeholder', () => {
    const { container } = render(
      <Icon name="material-symbols:close" data-icon="inline-start" aria-label="Close" inline />,
    )

    const placeholder = container.firstElementChild as SVGSVGElement
    expect(placeholder.getAttribute('data-icon')).toBe('inline-start')
    expect(placeholder.getAttribute('aria-label')).toBe('Close')
    expect(placeholder.hasAttribute('inline')).toBe(false)
  })
})
