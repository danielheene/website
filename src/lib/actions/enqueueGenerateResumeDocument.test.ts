import { getPayload } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { WorkflowSlug } from '@/types/jobs-queue'

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

import { enqueueGenerateResumeDocument } from './enqueueGenerateResumeDocument'

/** Distinct values so an argument swap in the call site cannot pass unnoticed. */
const TIMEOUT_BETWEEN_JOBS = 10 * 60 * 1000
const GENERATE_THROTTLE = 5 * 60 * 1000
const MAXIMUM_RETRIES = 3

const SETTINGS = {
  documentTitleTemplate: 'Resume {nanoid}',
  filenameTemplate: 'resume-{locale}',
  generateThrottle: GENERATE_THROTTLE,
  maximumRetries: MAXIMUM_RETRIES,
  timeoutBetweenJobs: TIMEOUT_BETWEEN_JOBS,
}

type QueueArgs = {
  workflow: string
  waitUntil: Date
  input: {
    sharedId: string
    maximumRetries: number
  }
}

const queue = vi.fn(async (_args: QueueArgs) => ({
  id: 'job-1',
  waitUntil: new Date(),
}))
const find = vi.fn(async () => ({
  docs: [] as unknown[],
}))
const findGlobal = vi.fn(async () => SETTINGS)
const runByID = vi.fn(async () => ({}))
const loggerError = vi.fn()

/**
 * `getPayload` is stubbed globally in vitest.setup.ts with a fixed shape; this
 * module needs `jobs.queue`/`jobs.runByID` and per-test control over
 * `find`/`findGlobal`.
 */
beforeEach(() => {
  queue.mockClear()
  find.mockClear()
  find.mockResolvedValue({
    docs: [],
  })
  findGlobal.mockClear()
  findGlobal.mockResolvedValue(SETTINGS)
  runByID.mockClear()
  loggerError.mockClear()
  afterMock.mockClear()

  vi.mocked(getPayload).mockResolvedValue({
    find,
    findGlobal,
    jobs: {
      queue,
      runByID,
    },
    logger: {
      info: vi.fn(),
      error: loggerError,
    },
  } as never)
})

/** The `waitUntil` the action passed to `payload.jobs.queue`. */
const queuedWaitUntil = (): Date => queue.mock.calls[0][0].waitUntil

describe('enqueueGenerateResumeDocument', () => {
  it('queues the resume workflow with the settings templates and retries', async () => {
    await enqueueGenerateResumeDocument()

    expect(queue).toHaveBeenCalledTimes(1)
    expect(queue.mock.calls[0][0]).toMatchObject({
      workflow: WorkflowSlug.GenerateResumeDocument,
      input: {
        documentTitleTemplate: SETTINGS.documentTitleTemplate,
        filenameTemplate: SETTINGS.filenameTemplate,
        maximumRetries: MAXIMUM_RETRIES,
      },
    })
  })

  it('returns the queued job id', async () => {
    const result = await enqueueGenerateResumeDocument()

    expect(result).toEqual({
      jobId: 'job-1',
    })
  })

  it('does not force-run the job when forceNow is not set', async () => {
    await enqueueGenerateResumeDocument()

    expect(afterMock).not.toHaveBeenCalled()
    expect(runByID).not.toHaveBeenCalled()
  })

  it('generates a fresh sharedId per call', async () => {
    await enqueueGenerateResumeDocument()
    await enqueueGenerateResumeDocument()

    const [first, second] = queue.mock.calls.map((call) => call[0].input.sharedId)

    expect(first).toHaveLength(32)
    expect(second).not.toBe(first)
  })

  describe('delay calculation', () => {
    it('throttles from now when no recent job exists', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'))

      await enqueueGenerateResumeDocument()

      // No prior job: earliestPossible is now, plus throttle only.
      expect(queuedWaitUntil().toISOString()).toBe('2026-01-01T12:05:00.000Z')
    })

    it('delays by timeout + throttle from a completed job', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'))
      find.mockResolvedValue({
        docs: [
          {
            completedAt: '2026-01-01T11:58:00.000Z',
            hasError: false,
          },
        ],
      })

      await enqueueGenerateResumeDocument()

      // completedAt 11:58 + 10min timeout + 5min throttle.
      expect(queuedWaitUntil().toISOString()).toBe('2026-01-01T12:13:00.000Z')
    })

    it('delays from updatedAt when the last job errored', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'))
      find.mockResolvedValue({
        docs: [
          {
            completedAt: '2026-01-01T11:30:00.000Z',
            hasError: true,
            updatedAt: '2026-01-01T11:59:00.000Z',
          },
        ],
      })

      await enqueueGenerateResumeDocument()

      // An errored job uses updatedAt (11:59), not its stale completedAt.
      expect(queuedWaitUntil().toISOString()).toBe('2026-01-01T12:14:00.000Z')
    })

    it('delays from now when a job is still processing', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'))
      find.mockResolvedValue({
        docs: [
          {
            processing: true,
          },
        ],
      })

      await enqueueGenerateResumeDocument()

      expect(queuedWaitUntil().toISOString()).toBe('2026-01-01T12:15:00.000Z')
    })

    it('rounds down to the minute when past seconds are 30 or less', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-01T12:00:20.000Z'))

      await enqueueGenerateResumeDocument()

      // 12:05:20 -> seconds <= 30, so the minute is truncated, not advanced.
      expect(queuedWaitUntil().toISOString()).toBe('2026-01-01T12:05:00.000Z')
    })

    it('rounds up to the next minute when past seconds exceed 30', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-01T12:00:45.000Z'))

      await enqueueGenerateResumeDocument()

      // 12:05:45 -> seconds > 30, so it advances to 12:06.
      expect(queuedWaitUntil().toISOString()).toBe('2026-01-01T12:06:00.000Z')
    })

    it('always returns a zeroed seconds and milliseconds boundary', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-01T12:00:17.456Z'))

      await enqueueGenerateResumeDocument()

      const waitUntil = queuedWaitUntil()
      expect(waitUntil.getSeconds()).toBe(0)
      expect(waitUntil.getMilliseconds()).toBe(0)
    })
  })

  describe('forceNow', () => {
    it('skips the throttle and queues immediately', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-01T12:00:33.000Z'))

      await enqueueGenerateResumeDocument({
        forceNow: true,
      })

      // Bypasses rounding too — the exact current instant.
      expect(queuedWaitUntil().toISOString()).toBe('2026-01-01T12:00:33.000Z')
      expect(find).not.toHaveBeenCalled()
    })

    it('does not consult prior jobs even when one is processing', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'))
      find.mockResolvedValue({
        docs: [
          {
            processing: true,
          },
        ],
      })

      await enqueueGenerateResumeDocument({
        forceNow: true,
      })

      expect(queuedWaitUntil().toISOString()).toBe('2026-01-01T12:00:00.000Z')
    })

    it('runs the job immediately via after() rather than waiting for autoRun', async () => {
      await enqueueGenerateResumeDocument({
        forceNow: true,
      })

      expect(afterMock).toHaveBeenCalledTimes(1)
      expect(runByID).toHaveBeenCalledWith({
        id: 'job-1',
      })
    })

    it('logs rather than throws when the forced run fails', async () => {
      runByID.mockRejectedValueOnce(new Error('boom'))

      await expect(
        enqueueGenerateResumeDocument({
          forceNow: true,
        }),
      ).resolves.toEqual({
        jobId: 'job-1',
      })

      expect(loggerError).toHaveBeenCalledWith(expect.stringContaining('boom'))
    })
  })

  describe('prop overrides', () => {
    it('prefers explicit throttle and timeout over the global settings', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'))
      find.mockResolvedValue({
        docs: [
          {
            completedAt: '2026-01-01T12:00:00.000Z',
            hasError: false,
          },
        ],
      })

      await enqueueGenerateResumeDocument({
        generateThrottle: 60 * 1000,
        timeoutBetweenJobs: 2 * 60 * 1000,
      })

      // 12:00 + 2min timeout + 1min throttle, not the 10/5 from settings.
      expect(queuedWaitUntil().toISOString()).toBe('2026-01-01T12:03:00.000Z')
    })

    it('prefers an explicit maximumRetries over the global settings', async () => {
      await enqueueGenerateResumeDocument({
        maximumRetries: 9,
      })

      expect(queue.mock.calls[0][0]).toMatchObject({
        input: {
          maximumRetries: 9,
        },
      })
    })

    it('falls back to a settings value when the prop is undefined', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'))

      await enqueueGenerateResumeDocument({
        generateThrottle: undefined,
      })

      expect(queuedWaitUntil().toISOString()).toBe('2026-01-01T12:05:00.000Z')
    })
  })
})
