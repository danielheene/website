import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchAnthropicTranslationMock = vi.fn()
const publishMock = vi.fn()
const findByIDMock = vi.fn()
const updateMock = vi.fn()
const loggerErrorMock = vi.fn()

vi.mock('@/lib/fetchAnthropicTranslation', () => ({
  fetchAnthropicTranslation: (...args: unknown[]) => fetchAnthropicTranslationMock(...args),
}))

vi.mock('@/lib/RedisHandler', () => ({
  publish: (...args: unknown[]) => publishMock(...args),
}))

const { autoTranslateBilingualField } = await import('./autoTranslateBilingualField')

const paragraph = (text: string) => ({
  root: {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text,
          },
        ],
      },
    ],
  },
})

const emptyParagraph = () => ({
  root: {
    children: [
      {
        type: 'paragraph',
        children: [],
      },
    ],
  },
})

const baseInput = {
  collectionSlug: 'resume-jobs',
  path: 'tasks.0.task',
  sourceLanguage: 'en',
  targetLanguage: 'de',
  sourceValue: paragraph('Hello'),
}

const req = {
  payload: {
    findByID: findByIDMock,
    update: updateMock,
    logger: {
      error: loggerErrorMock,
    },
  },
}

const runHandler = (input: Record<string, unknown>) =>
  // biome-ignore lint/suspicious/noExplicitAny: test-only loose call into the handler
  (autoTranslateBilingualField.handler as any)({
    input,
    job: {
      id: 'job-1',
    },
    req,
  })

beforeEach(() => {
  fetchAnthropicTranslationMock.mockReset()
  publishMock.mockReset()
  findByIDMock.mockReset()
  updateMock.mockReset()
  loggerErrorMock.mockReset()
})

describe('autoTranslateBilingualField', () => {
  describe('manual mode', () => {
    it('translates and publishes the result without touching the document', async () => {
      fetchAnthropicTranslationMock.mockResolvedValue(paragraph('Hallo'))

      const result = await runHandler({
        ...baseInput,
        mode: 'manual',
      })

      expect(fetchAnthropicTranslationMock).toHaveBeenCalledWith({
        value: baseInput.sourceValue,
        sourceLanguage: 'en',
        targetLanguage: 'de',
      })
      expect(findByIDMock).not.toHaveBeenCalled()
      expect(updateMock).not.toHaveBeenCalled()
      expect(publishMock).toHaveBeenCalledWith(
        'bilingual-translate:job-1',
        expect.objectContaining({
          status: 'progress',
        }),
      )
      expect(publishMock).toHaveBeenLastCalledWith('bilingual-translate:job-1', {
        status: 'success',
        translated: paragraph('Hallo'),
      })
      expect(result).toEqual({
        output: {
          success: true,
        },
      })
    })

    it('publishes skipped and returns early when the translation is empty', async () => {
      fetchAnthropicTranslationMock.mockResolvedValue(null)

      const result = await runHandler({
        ...baseInput,
        mode: 'manual',
      })

      expect(updateMock).not.toHaveBeenCalled()
      expect(publishMock).toHaveBeenLastCalledWith('bilingual-translate:job-1', {
        status: 'skipped',
        reason: 'empty-translation',
      })
      expect(result).toEqual({
        output: {
          skipped: true,
        },
      })
    })
  })

  describe('auto mode', () => {
    it('skips without calling the model when there is no docId', async () => {
      const result = await runHandler({
        ...baseInput,
        mode: 'auto',
      })

      expect(findByIDMock).not.toHaveBeenCalled()
      expect(fetchAnthropicTranslationMock).not.toHaveBeenCalled()
      expect(publishMock).toHaveBeenLastCalledWith('bilingual-translate:job-1', {
        status: 'skipped',
        reason: 'no-doc-id',
      })
      expect(result).toEqual({
        output: {
          skipped: true,
        },
      })
    })

    it('re-checks the target and skips when it was already filled in the meantime', async () => {
      findByIDMock.mockResolvedValue({
        tasks: [
          {
            task: {
              de: paragraph('Bereits übersetzt'),
            },
          },
        ],
      })

      const result = await runHandler({
        ...baseInput,
        mode: 'auto',
        docId: 'doc-1',
      })

      expect(fetchAnthropicTranslationMock).not.toHaveBeenCalled()
      expect(updateMock).not.toHaveBeenCalled()
      expect(publishMock).toHaveBeenLastCalledWith('bilingual-translate:job-1', {
        status: 'skipped',
        reason: 'target-already-populated',
      })
      expect(result).toEqual({
        output: {
          skipped: true,
        },
      })
    })

    it('translates and patches the document at the exact nested path with the re-entry guard', async () => {
      findByIDMock.mockResolvedValue({
        id: 'doc-1',
        tasks: [
          {
            task: {
              en: paragraph('Hello'),
              de: emptyParagraph(),
            },
          },
        ],
      })
      fetchAnthropicTranslationMock.mockResolvedValue(paragraph('Hallo'))

      const result = await runHandler({
        ...baseInput,
        path: 'tasks.0.task',
        mode: 'auto',
        docId: 'doc-1',
      })

      expect(updateMock).toHaveBeenCalledTimes(1)
      const [call] = updateMock.mock.calls
      expect(call[0]).toMatchObject({
        collection: baseInput.collectionSlug,
        id: 'doc-1',
        context: {
          skipAutoTranslate: true,
        },
      })
      expect(call[0].data.tasks[0].task.de).toEqual(paragraph('Hallo'))
      // The re-check read must not be mutated in place before cloning.
      expect(call[0].data).not.toBe(findByIDMock.mock.results[0]?.value)
      expect(publishMock).toHaveBeenLastCalledWith('bilingual-translate:job-1', {
        status: 'success',
        translated: paragraph('Hallo'),
      })
      expect(result).toEqual({
        output: {
          success: true,
        },
      })
    })
  })

  describe('failures', () => {
    it('publishes an error message, logs, and rethrows so the job retries', async () => {
      fetchAnthropicTranslationMock.mockRejectedValue(new Error('Claude is down'))

      await expect(
        runHandler({
          ...baseInput,
          mode: 'manual',
        }),
      ).rejects.toThrow('Claude is down')

      expect(loggerErrorMock).toHaveBeenCalledWith(expect.stringContaining('Claude is down'))
      expect(publishMock).toHaveBeenLastCalledWith('bilingual-translate:job-1', {
        status: 'error',
        message: 'Claude is down',
      })
    })
  })
})
