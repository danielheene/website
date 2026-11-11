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

const { ANTHROPIC_MODEL, ANTHROPIC_TRANSLATION_MODEL, generateAnthropicText, stripCodeFence } =
  await import('./generateAnthropicText')

const call = () =>
  generateAnthropicText({
    functionId: 'test',
    system: 'Be brief.',
    maxOutputTokens: 512,
    prompt: 'Hello',
  })

describe('generateAnthropicText', () => {
  beforeEach(() => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'sk-ant-test')
    generateTextMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('calls the current Haiku at low effort with an output limit and a timeout', async () => {
    generateTextMock.mockResolvedValue({
      text: 'Hi',
      finishReason: 'stop',
    })

    await expect(call()).resolves.toBe('Hi')

    const [options] = generateTextMock.mock.calls[0]

    expect(options.model.modelId).toBe(ANTHROPIC_MODEL)
    expect(ANTHROPIC_MODEL).toBe('claude-haiku-5-5')
    expect(options.providerOptions.anthropic.effort).toBe('low')
    expect(options.maxOutputTokens).toBe(512)
    expect(options.timeout).toBeGreaterThan(0)
    expect(options.system).toBe('Be brief.')
    expect(options.prompt).toBe('Hello')
  })

  it('uses the model a caller names instead of the default', async () => {
    generateTextMock.mockResolvedValue({
      text: 'Hi',
      finishReason: 'stop',
    })

    await generateAnthropicText({
      functionId: 'test',
      system: 'Be brief.',
      maxOutputTokens: 512,
      model: ANTHROPIC_TRANSLATION_MODEL,
      prompt: 'Hello',
    })

    expect(generateTextMock.mock.calls[0][0].model.modelId).toBe('claude-sonnet-5-5')
  })

  it.each(['length', 'content-filter', 'error', 'other'])(
    'throws instead of returning a partial answer when the model stops with %s',
    async (finishReason) => {
      generateTextMock.mockResolvedValue({
        text: 'Half an ans',
        finishReason,
      })

      await expect(call()).rejects.toThrow(finishReason)
    },
  )

  it('throws before calling the model when ANTHROPIC_API_KEY is not configured', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '')

    await expect(call()).rejects.toThrow(/ANTHROPIC_API_KEY/)
    expect(generateTextMock).not.toHaveBeenCalled()
  })
})

describe('stripCodeFence', () => {
  it.each([
    ['```html\n<p>Hi</p>\n```', '<p>Hi</p>'],
    ['```\nplain\n```', 'plain'],
    ['  no fence  ', 'no fence'],
  ])('turns %j into %j', (input, expected) => {
    expect(stripCodeFence(input)).toBe(expected)
  })
})
