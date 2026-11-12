import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText, type ModelMessage } from 'ai'

export const ANTHROPIC_MODEL = 'claude-haiku-5-5'

/**
 * Résumé wording is read closely and translated rarely, so the translation
 * uses the stronger model; everything else stays on the cheap one.
 */
export const ANTHROPIC_TRANSLATION_MODEL = 'claude-sonnet-5-5'

type AnthropicModel = typeof ANTHROPIC_MODEL | typeof ANTHROPIC_TRANSLATION_MODEL

// One model call; none of the tasks here should take longer.
const TIMEOUT_MS = 60_000

type GenerateAnthropicTextArgs = {
  /** Telemetry identifier, the name of the calling fetcher. */
  functionId: string
  system: string
  /** Thinking counts toward this, so leave room beyond the expected answer. */
  maxOutputTokens: number
  /** Defaults to `ANTHROPIC_MODEL`. */
  model?: AnthropicModel
} & (
  | {
      prompt: string
    }
  | {
      messages: ModelMessage[]
    }
)

/** Models sometimes wrap HTML or plain text in a markdown fence despite being told not to. */
export const stripCodeFence = (text: string): string =>
  text
    .replace(/^\s*```(?:\w+)?\s*\n?/, '')
    .replace(/\n?\s*```\s*$/, '')
    .trim()

/**
 * Shared Claude call for the short generation tasks in this folder.
 *
 * Throws instead of returning a partial answer: a response cut off by the
 * token limit or declined by a safety filter must not be stored as content.
 */
export const generateAnthropicText = async ({
  functionId,
  system,
  maxOutputTokens,
  model = ANTHROPIC_MODEL,
  ...input
}: GenerateAnthropicTextArgs): Promise<string> => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured.')
  }

  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const { text, finishReason } = await generateText({
    model: anthropic(model),
    telemetry: {
      isEnabled: true,
      functionId,
    },
    maxOutputTokens,
    timeout: TIMEOUT_MS,
    providerOptions: {
      anthropic: {
        // Both models think more than these short tasks need by default.
        effort: 'low',
      },
    },
    system,
    ...input,
  })

  if (finishReason !== 'stop') {
    throw new Error(`Claude did not finish its answer (${finishReason}).`)
  }

  return stripCodeFence(text)
}
