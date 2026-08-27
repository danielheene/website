import { describe, expect, it } from 'vitest'

import { sanitizeSvg } from './sanitizeSvg'

describe('sanitizeSvg', () => {
  it('keeps legitimate SVG markup intact', () => {
    const result = sanitizeSvg(
      '<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="#1D27F2"/></svg>',
    )

    expect(result).toContain('<path')
    expect(result).toContain('viewBox="0 0 24 24"')
    expect(result).toContain('fill="#1D27F2"')
  })

  it('strips script elements', () => {
    const result = sanitizeSvg('<svg><script>alert(document.cookie)</script><circle r="5"/></svg>')

    expect(result).not.toContain('script')
    expect(result).not.toContain('alert')
    expect(result).toContain('<circle')
  })

  it('strips event handler attributes', () => {
    const result = sanitizeSvg('<svg><circle r="5" onload="alert(1)" onclick="alert(2)"/></svg>')

    expect(result).not.toContain('onload')
    expect(result).not.toContain('onclick')
    expect(result).not.toContain('alert')
    expect(result).toContain('<circle')
  })

  it('strips javascript: URLs', () => {
    const result = sanitizeSvg('<svg><a href="javascript:alert(1)"><circle r="5"/></a></svg>')

    expect(result).not.toContain('javascript:')
  })

  it('strips foreignObject, which can carry arbitrary HTML', () => {
    const result = sanitizeSvg(
      '<svg><foreignObject><img src=x onerror="alert(1)"/></foreignObject></svg>',
    )

    expect(result).not.toContain('foreignObject')
    expect(result).not.toContain('onerror')
  })

  it('strips animation elements that can set attributes at runtime', () => {
    const result = sanitizeSvg(
      '<svg><set attributeName="onload" to="alert(1)"/><animate attributeName="href" values="javascript:alert(1)"/></svg>',
    )

    expect(result).not.toContain('<set')
    expect(result).not.toContain('<animate')
    expect(result).not.toContain('javascript:')
  })

  it('handles an empty string', () => {
    expect(sanitizeSvg('')).toBe('')
  })
})
