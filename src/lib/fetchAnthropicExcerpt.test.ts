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

const { fetchAnthropicExcerpt } = await import('./fetchAnthropicExcerpt')

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

describe('fetchAnthropicExcerpt', () => {
  it('returns null without calling the model when the source is empty', async () => {
    const result = await fetchAnthropicExcerpt(paragraphDocument('') as never)

    expect(result).toBeNull()
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('sends the source HTML to the model and parses the excerpt result back into Lexical', async () => {
    generateTextMock.mockResolvedValue({
      text: '<p>A short summary of the post.</p>',
    })

    const result = await fetchAnthropicExcerpt(
      paragraphDocument('A long blog post body about something interesting.') as never,
    )

    expect(generateTextMock).toHaveBeenCalledTimes(1)
    const [call] = generateTextMock.mock.calls
    expect(call[0].prompt).toContain('A long blog post body about something interesting.')
    expect(call[0].system).toMatch(/excerpt/i)

    const root = result?.root as unknown as {
      children: Array<{
        children: Array<{
          text: string
        }>
      }>
    }
    expect(root.children[0].children[0].text).toBe('A short summary of the post.')
  })

  it('throws a friendly error when ANTHROPIC_API_KEY is not configured', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '')

    await expect(
      fetchAnthropicExcerpt(paragraphDocument('Some content here.') as never),
    ).rejects.toThrow(/ANTHROPIC_API_KEY/)

    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it("strips a leading '```html' + trailing '```' fence from the model output before parsing", async () => {
    generateTextMock.mockResolvedValue({
      text: '```html\n<p>A short summary.</p>\n```',
    })

    const result = await fetchAnthropicExcerpt(paragraphDocument('Some content here.') as never)

    const root = result?.root as unknown as {
      children: Array<{
        children: Array<{
          text: string
        }>
      }>
    }
    expect(root.children[0].children[0].text).toBe('A short summary.')
    expect(JSON.stringify(result)).not.toMatch(/```/)
  })
})
