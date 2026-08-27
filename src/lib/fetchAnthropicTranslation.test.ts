import { describe, expect, it, vi } from 'vitest'

const generateTextMock = vi.fn()

vi.mock('ai', () => ({
  generateText: (...args: unknown[]) => generateTextMock(...args),
}))

vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: () => (model: string) => ({
    modelId: model,
  }),
}))

const { fetchAnthropicTranslation } = await import('./fetchAnthropicTranslation')

const paragraphDocument = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: text
      ? [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [
              {
                type: 'text',
                format: 0,
                style: '',
                mode: 'normal',
                detail: 0,
                version: 1,
                text,
              },
            ],
          },
        ]
      : [],
  },
})

describe('fetchAnthropicTranslation', () => {
  it('returns null without calling the model when the source is empty', async () => {
    const result = await fetchAnthropicTranslation({
      value: paragraphDocument('') as never,
      sourceLanguage: 'en',
      targetLanguage: 'de',
    })

    expect(result).toBeNull()
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('sends the source HTML to the model and parses the translated result back into Lexical', async () => {
    generateTextMock.mockResolvedValue({
      text: '<p>Hallo Welt</p>',
    })

    const result = await fetchAnthropicTranslation({
      value: paragraphDocument('Hello world') as never,
      sourceLanguage: 'en',
      targetLanguage: 'de',
    })

    expect(generateTextMock).toHaveBeenCalledTimes(1)
    const [call] = generateTextMock.mock.calls
    expect(call[0].prompt).toContain('Hello world')
    expect(call[0].system).toContain('English')
    expect(call[0].system).toContain('German')

    const root = result?.root as unknown as {
      children: Array<{
        children: Array<{
          text: string
        }>
      }>
    }
    expect(root.children[0].children[0].text).toBe('Hallo Welt')
  })

  it('throws a friendly error when ANTHROPIC_API_KEY is not configured', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '')

    await expect(
      fetchAnthropicTranslation({
        value: paragraphDocument('Hello world') as never,
        sourceLanguage: 'en',
        targetLanguage: 'de',
      }),
    ).rejects.toThrow(/ANTHROPIC_API_KEY/)

    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it("strips a leading '```html' + trailing '```' fence from the model output before parsing", async () => {
    generateTextMock.mockResolvedValue({
      text: '```html\n<p>Hallo Welt</p>\n```',
    })

    const result = await fetchAnthropicTranslation({
      value: paragraphDocument('Hello world') as never,
      sourceLanguage: 'en',
      targetLanguage: 'de',
    })

    const root = result?.root as unknown as {
      children: Array<{
        children: Array<{
          text: string
        }>
      }>
    }
    expect(root.children[0].children[0].text).toBe('Hallo Welt')
    // Nothing from the fence leaks through as literal text
    expect(JSON.stringify(result)).not.toMatch(/```/)
    expect(JSON.stringify(result)).not.toMatch(/html/i)
  })
})
