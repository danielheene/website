// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Icon } from './Icon'

describe('Icon', () => {
  // Iconify fetches icon data after mount. Without a sized placeholder the
  // icon takes no space until then and shifts the layout when it appears.
  it('reserves a 1em box, with the caller’s classes, before the icon data loads', () => {
    const { container } = render(
      <Icon
        name="material-symbols:close"
        className="ml-8 text-xl"
        style={{
          color: 'red',
        }}
      />,
    )

    const placeholder = container.firstElementChild as HTMLElement
    expect(placeholder.tagName).toBe('SPAN')
    expect(placeholder.getAttribute('aria-hidden')).toBe('true')
    expect(placeholder.className).toContain('size-[1em]')
    expect(placeholder.className).toContain('inline-block')
    expect(placeholder.className).toContain('ml-8')
    expect(placeholder.style.color).toBe('red')
  })
})
