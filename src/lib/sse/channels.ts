import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/**
 *    Channels the SSE endpoint is allowed to subscribe to.
 *
 *    `/api/sse` is unauthenticated, so the `channel` query parameter must never
 *    reach `redis.subscribe()` unchecked — otherwise any visitor can attach to
 *    an arbitrary Pub/Sub channel and read whatever is published there.
 *
 *    Add a channel here before streaming it to the browser.
 */
export const SSE_CHANNELS = [
  'service-status',
] as const

export type SseChannel = (typeof SSE_CHANNELS)[number]

/**
 * Narrows an untrusted query-string value to a known public channel.
 */
export const isSseChannel = (value: string | null): value is SseChannel =>
  value !== null && (SSE_CHANNELS as readonly string[]).includes(value)

/**
 *    Per-job progress channels for `AutoTranslateBilingualField` (see
 *    `src/jobs-queue/tasks/autoTranslateBilingualField.ts`), one per queued
 *    job rather than a fixed slug from `SSE_CHANNELS` above.
 *
 *    Translated CV content isn't public, so unlike the channels above, the
 *    route additionally requires an authenticated session before subscribing
 *    to one of these — see `app/(frontend)/api/sse/route.ts`. The prefix
 *    match here only narrows the shape of the value; it is not itself an
 *    access check.
 */
const BILINGUAL_TRANSLATE_CHANNEL_PREFIX = 'bilingual-translate:'

/** Payload job IDs are Mongo ObjectIds or short numeric/UUID strings. */
const JOB_ID_PATTERN = /^[a-zA-Z0-9-]{1,64}$/

export const bilingualTranslateChannel = (jobId: string): string =>
  `${BILINGUAL_TRANSLATE_CHANNEL_PREFIX}${jobId}`

/**
 * Narrows an untrusted query-string value to a well-formed (not yet
 * authorized) bilingual-translate job channel.
 */
export const isBilingualTranslateChannel = (value: string | null): value is string =>
  Boolean(value?.startsWith(BILINGUAL_TRANSLATE_CHANNEL_PREFIX)) &&
  JOB_ID_PATTERN.test((value as string).slice(BILINGUAL_TRANSLATE_CHANNEL_PREFIX.length))

/**
 *    Shape of the messages published on a `bilingualTranslateChannel`, as the
 *    `AutoTranslateBilingualField` task runs. Lives here (rather than next to
 *    the task) so the client-side `TranslateControls` component can import
 *    just the type without pulling in the task module's server-only
 *    dependencies (Redis, Payload's local API, etc.).
 */
export type AutoTranslateBilingualFieldProgress =
  | {
      status: 'progress'
      message: string
    }
  | {
      status: 'success'
      translated: SerializedEditorState
    }
  | {
      status: 'skipped'
      reason: 'no-doc-id' | 'target-already-populated' | 'empty-translation'
    }
  | {
      status: 'error'
      message: string
    }
