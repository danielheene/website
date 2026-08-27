import { beforeEach, describe, expect, it, vi } from 'vitest'

import { QueueSlug } from '@/types/jobs-queue'

import { enqueueAutoTranslate } from './enqueueAutoTranslate'

const paragraph = (text: string) => ({
  root: {
    children: text
      ? [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text,
              },
            ],
          },
        ]
      : [],
  },
})

const queueMock = vi.fn()

const baseArgs = {
  data: {
    id: 'doc-1',
  },
  req: {
    payload: {
      jobs: {
        queue: queueMock,
      },
    },
    routeParams: {},
  },
  operation: 'update' as const,
  path: [
    'tasks',
    0,
    'task',
  ],
  collection: {
    slug: 'resume-jobs',
  },
  context: {},
}

beforeEach(() => {
  queueMock.mockReset()
  queueMock.mockResolvedValue({
    id: 'job-1',
  })
})

// biome-ignore lint/suspicious/noExplicitAny: loose call into the hook for tests
const runHook = (overrides: Record<string, unknown>) => (enqueueAutoTranslate as any)(overrides)

describe('enqueueAutoTranslate', () => {
  it('enqueues an en->de job when English is populated and German is empty (and was empty before)', async () => {
    await runHook({
      ...baseArgs,
      value: {
        en: paragraph('Hello'),
        de: paragraph(''),
      },
      previousValue: {
        en: paragraph(''),
        de: paragraph(''),
      },
    })

    expect(queueMock).toHaveBeenCalledTimes(1)
    expect(queueMock).toHaveBeenCalledWith({
      task: 'AutoTranslateBilingualField',
      queue: QueueSlug.Default,
      input: {
        mode: 'auto',
        collectionSlug: 'resume-jobs',
        docId: 'doc-1',
        path: 'tasks.0.task',
        sourceLanguage: 'en',
        targetLanguage: 'de',
        sourceValue: paragraph('Hello'),
      },
    })
  })

  it('enqueues a de->en job when German is populated and English is empty (and was empty before)', async () => {
    await runHook({
      ...baseArgs,
      value: {
        en: paragraph(''),
        de: paragraph('Hallo'),
      },
      previousValue: {
        en: paragraph(''),
        de: paragraph(''),
      },
    })

    expect(queueMock).toHaveBeenCalledTimes(1)
    expect(queueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          sourceLanguage: 'de',
          targetLanguage: 'en',
        }),
      }),
    )
  })

  it('enqueues neither direction when both sides are pasted in at once (neither target is empty now)', async () => {
    // Each direction's guard requires its own target to be empty *now*; with
    // both sides populated simultaneously, neither target qualifies.
    await runHook({
      ...baseArgs,
      value: {
        en: paragraph('Hello'),
        de: paragraph('Hallo'),
      },
      previousValue: {
        en: paragraph(''),
        de: paragraph(''),
      },
    })

    expect(queueMock).not.toHaveBeenCalled()
  })

  it('does not enqueue when both sides are empty', async () => {
    await runHook({
      ...baseArgs,
      value: {
        en: paragraph(''),
        de: paragraph(''),
      },
      previousValue: {
        en: paragraph(''),
        de: paragraph(''),
      },
    })

    expect(queueMock).not.toHaveBeenCalled()
  })

  it('does not enqueue when both sides are already populated', async () => {
    await runHook({
      ...baseArgs,
      value: {
        en: paragraph('Hello'),
        de: paragraph('Hallo'),
      },
      previousValue: {
        en: paragraph('Hello'),
        de: paragraph('Hallo'),
      },
    })

    expect(queueMock).not.toHaveBeenCalled()
  })

  it('does not re-fill a target the user deliberately cleared (previousValue target was populated)', async () => {
    await runHook({
      ...baseArgs,
      value: {
        en: paragraph('Hello'),
        de: paragraph(''),
      },
      previousValue: {
        en: paragraph('Hello'),
        de: paragraph('Auf Wiedersehen'),
      },
    })

    expect(queueMock).not.toHaveBeenCalled()
  })

  it('respects the context.skipAutoTranslate escape hatch', async () => {
    await runHook({
      ...baseArgs,
      value: {
        en: paragraph('Hello'),
        de: paragraph(''),
      },
      previousValue: {
        en: paragraph(''),
        de: paragraph(''),
      },
      context: {
        skipAutoTranslate: true,
      },
    })

    expect(queueMock).not.toHaveBeenCalled()
  })

  it('does nothing for a global field (no collection slug)', async () => {
    await runHook({
      ...baseArgs,
      collection: null,
      value: {
        en: paragraph('Hello'),
        de: paragraph(''),
      },
      previousValue: {
        en: paragraph(''),
        de: paragraph(''),
      },
    })

    expect(queueMock).not.toHaveBeenCalled()
  })

  it('does nothing without a document id', async () => {
    await runHook({
      ...baseArgs,
      data: {},
      req: {
        payload: {
          jobs: {
            queue: queueMock,
          },
        },
        routeParams: {},
      },
      value: {
        en: paragraph('Hello'),
        de: paragraph(''),
      },
      previousValue: {
        en: paragraph(''),
        de: paragraph(''),
      },
    })

    expect(queueMock).not.toHaveBeenCalled()
  })

  it('does nothing outside create/update operations', async () => {
    await runHook({
      ...baseArgs,
      operation: 'delete',
      value: {
        en: paragraph('Hello'),
        de: paragraph(''),
      },
      previousValue: {
        en: paragraph(''),
        de: paragraph(''),
      },
    })

    expect(queueMock).not.toHaveBeenCalled()
  })

  it('returns the value unchanged', async () => {
    const value = {
      en: paragraph('Hello'),
      de: paragraph(''),
    }

    const result = await runHook({
      ...baseArgs,
      value,
      previousValue: {
        en: paragraph(''),
        de: paragraph(''),
      },
    })

    expect(result).toBe(value)
  })
})
