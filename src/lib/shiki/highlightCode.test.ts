import { describe, expect, it } from 'vitest'

import { highlightCode, SUPPORTED_LANGUAGES } from './highlightCode'

describe('highlightCode', () => {
  it('returns a pre/code structure', async () => {
    const html = await highlightCode({
      code: 'const a = 1',
      language: 'typescript',
    })

    expect(html).toContain('<pre')
    expect(html).toContain('<code')
    expect(html).toContain('shiki')
  })

  it('emits both theme variables so CSS can switch without re-highlighting', async () => {
    const html = await highlightCode({
      code: 'const a = 1',
      language: 'typescript',
    })

    expect(html).toContain('--shiki-light')
    expect(html).toContain('--shiki-dark')
  })

  it('tokenizes rather than returning the raw string', async () => {
    const html = await highlightCode({
      code: 'const a = 1',
      language: 'typescript',
    })

    // `const` should be wrapped in its own coloured span
    expect(html).toMatch(/<span[^>]*>const<\/span>/)
  })

  it('escapes HTML in the source', async () => {
    const html = await highlightCode({
      code: 'const x = "<script>alert(1)</script>"',
      language: 'typescript',
    })

    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&#x3C;script>')
  })

  it('highlights every language the code field offers', async () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const html = await highlightCode({
        code: 'test',
        language,
      })
      expect(html).toContain('<pre')
    }
  })

  it('falls back for unknown languages instead of throwing', async () => {
    const html = await highlightCode({
      code: 'SELECT 1',
      language: 'brainfuck',
    })

    expect(html).toContain('<pre')
  })

  it('falls back when no language is given', async () => {
    const html = await highlightCode({
      code: 'const a = 1',
    })

    expect(html).toContain('<pre')
  })

  it('handles empty and multiline input', async () => {
    expect(
      await highlightCode({
        code: '',
        language: 'typescript',
      }),
    ).toContain('<pre')

    const multiline = await highlightCode({
      code: 'const a = 1\nconst b = 2\nconst c = 3',
      language: 'typescript',
    })
    expect(multiline.match(/class="line"/g)).toHaveLength(3)
  })

  it('reuses the cached highlighter across calls', async () => {
    const started = Date.now()
    await highlightCode({
      code: 'a',
      language: 'typescript',
    })
    const firstDuration = Date.now() - started

    const secondStarted = Date.now()
    await highlightCode({
      code: 'b',
      language: 'typescript',
    })
    const secondDuration = Date.now() - secondStarted

    // the second call must not pay grammar/engine load cost again
    expect(secondDuration).toBeLessThanOrEqual(Math.max(firstDuration, 50))
  })
})
