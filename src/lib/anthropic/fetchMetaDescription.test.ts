import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const generateTextMock = vi.fn()

vi.mock('ai', () => ({
  generateText: (...args: unknown[]) => generateTextMock(...args),
}))

vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: () => (model: string) => ({
    modelId: model,
  }),
}))

const { clampMetaDescription, fetchAnthropicMetaDescription, META_DESCRIPTION_MAX_LENGTH } =
  await import('./fetchMetaDescription')

const post = {
  title: 'Caching in Next.js',
  slug: 'caching-in-next-js',
  content: {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: 'How cache tags and revalidation fit together.',
            },
          ],
        },
      ],
    },
  },
}

describe('fetchAnthropicMetaDescription', () => {
  beforeEach(() => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'sk-ant-test')
    generateTextMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("sends the document's own title and text, not a URL", async () => {
    generateTextMock.mockResolvedValue({
      text: 'How cache tags and revalidation work together in Next.js.',
      finishReason: 'stop',
    })

    const result = await fetchAnthropicMetaDescription({
      collection: 'posts',
      data: post,
    })

    expect(result).toBe('How cache tags and revalidation work together in Next.js.')

    const [options] = generateTextMock.mock.calls[0]

    expect(options.prompt).toContain('<type>blog post</type>')
    expect(options.prompt).toContain('Caching in Next.js')
    expect(options.prompt).toContain('How cache tags and revalidation fit together.')
    expect(options.prompt).not.toMatch(/https?:\/\//)
    expect(options.prompt).not.toContain('caching-in-next-js')
  })

  it('returns null without calling the model when the document has no text', async () => {
    const result = await fetchAnthropicMetaDescription({
      collection: 'pages',
      data: {
        slug: 'empty',
      },
    })

    expect(result).toBeNull()
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('shortens an over-long answer to the limit', async () => {
    generateTextMock.mockResolvedValue({
      text: 'word '.repeat(60),
      finishReason: 'stop',
    })

    const result = await fetchAnthropicMetaDescription({
      collection: 'pages',
      data: post,
    })

    expect(result?.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX_LENGTH)
  })
})

describe('clampMetaDescription', () => {
  it('leaves a description within the limit alone, collapsing whitespace', () => {
    expect(clampMetaDescription('  Short   and\nsweet. ')).toBe('Short and sweet.')
  })

  it('cuts at the last complete sentence when one ends late enough', () => {
    const first = `${'A'.repeat(100)}.`
    const result = clampMetaDescription(`${first} ${'B'.repeat(100)}.`)

    expect(result).toBe(first)
  })

  it('otherwise cuts at a word boundary and adds an ellipsis', () => {
    const result = clampMetaDescription('word '.repeat(60))

    expect(result.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX_LENGTH)
    expect(result.endsWith('word…')).toBe(true)
  })

  it('still respects the limit for one unbroken string', () => {
    expect(clampMetaDescription('x'.repeat(300)).length).toBe(META_DESCRIPTION_MAX_LENGTH)
  })
})
