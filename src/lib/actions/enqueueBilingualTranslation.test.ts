import { getPayload } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({
  default: {},
}))

const afterMock = vi.fn((task: () => Promise<void>) => task())

vi.mock('next/server', () => ({
  after: (...args: unknown[]) =>
    afterMock(
      ...(args as [
        () => Promise<void>,
      ]),
    ),
}))

import { QueueSlug } from '@/types/jobs-queue'

import { enqueueBilingualTranslation } from './enqueueBilingualTranslation'

const queueMock = vi.fn(async () => ({
  id: 'job-1',
}))
const runByIDMock = vi.fn(async () => ({}))
const loggerErrorMock = vi.fn()

const baseArgs = {
  collectionSlug: 'resume-jobs',
  docId: 'doc-1',
  path: 'tasks.0.task',
  sourceLanguage: 'en' as const,
  targetLanguage: 'de' as const,
  sourceValue: {
    root: {
      children: [],
    },
  } as never,
}

beforeEach(() => {
  queueMock.mockClear()
  runByIDMock.mockClear()
  loggerErrorMock.mockClear()
  afterMock.mockClear()

  vi.mocked(getPayload).mockResolvedValue({
    jobs: {
      queue: queueMock,
      runByID: runByIDMock,
    },
    logger: {
      error: loggerErrorMock,
    },
  } as never)
})

describe('enqueueBilingualTranslation', () => {
  it('queues a manual-mode job with the given input and returns its id', async () => {
    const result = await enqueueBilingualTranslation(baseArgs)

    expect(result).toEqual({
      jobId: 'job-1',
    })
    expect(queueMock).toHaveBeenCalledWith({
      task: 'AutoTranslateBilingualField',
      queue: QueueSlug.Default,
      input: {
        mode: 'manual',
        collectionSlug: baseArgs.collectionSlug,
        docId: baseArgs.docId,
        path: baseArgs.path,
        sourceLanguage: 'en',
        targetLanguage: 'de',
        sourceValue: baseArgs.sourceValue,
      },
    })
  })

  it('triggers the job to run via after(), passing the queued job id', async () => {
    await enqueueBilingualTranslation(baseArgs)

    expect(afterMock).toHaveBeenCalledTimes(1)
    expect(runByIDMock).toHaveBeenCalledWith({
      id: 'job-1',
    })
  })

  it('logs rather than throwing when the triggered run fails', async () => {
    runByIDMock.mockRejectedValueOnce(new Error('worker busy'))

    await expect(enqueueBilingualTranslation(baseArgs)).resolves.toEqual({
      jobId: 'job-1',
    })
    expect(loggerErrorMock).toHaveBeenCalledWith(expect.stringContaining('worker busy'))
  })

  it('queues without a docId for a not-yet-saved document', async () => {
    const { docId, ...withoutDocId } = baseArgs

    await enqueueBilingualTranslation(withoutDocId)

    expect(queueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          docId: undefined,
        }),
      }),
    )
  })
})
