import { getPayload } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { scheduledJobChannel } from '@/lib/sse/channels'

vi.mock('@payload-config', () => ({
  default: {},
}))

const JOB_ID = 'job-1'

const findByID = vi.fn(async () => ({
  id: JOB_ID,
  processing: false,
  completedAt: null,
  hasError: false,
}))
const cancelByID = vi.fn(async () => undefined)
const logError = vi.fn()
const publishMock = vi.fn()

vi.mock('@/lib/RedisHandler', () => ({
  publish: (...args: unknown[]) => publishMock(...args),
}))

const { cancelScheduledJob } = await import('./cancelScheduledJob')

/**
 * `getPayload` is stubbed globally in vitest.setup.ts with a fixed shape;
 * this module needs `findByID` and `jobs.cancelByID` under per-test control.
 */
beforeEach(() => {
  findByID.mockClear()
  findByID.mockResolvedValue({
    id: JOB_ID,
    processing: false,
    completedAt: null,
    hasError: false,
  })
  cancelByID.mockClear()
  cancelByID.mockResolvedValue(undefined)
  logError.mockClear()
  publishMock.mockClear()

  vi.mocked(getPayload).mockResolvedValue({
    findByID,
    jobs: {
      cancelByID,
    },
    logger: {
      info: vi.fn(),
      error: logError,
    },
  } as never)
})

describe('cancelScheduledJob', () => {
  it('cancels a still-pending job', async () => {
    await cancelScheduledJob(JOB_ID)

    expect(cancelByID).toHaveBeenCalledTimes(1)
    expect(cancelByID).toHaveBeenCalledWith({
      id: JOB_ID,
    })
  })

  it('publishes a cancelled message on the job channel once it finishes', async () => {
    await cancelScheduledJob(JOB_ID)

    expect(publishMock).toHaveBeenCalledTimes(1)
    expect(publishMock).toHaveBeenCalledWith(scheduledJobChannel(JOB_ID), {
      status: 'cancelled',
    })
  })

  it('does nothing when the job no longer exists', async () => {
    findByID.mockResolvedValue(null)

    await cancelScheduledJob(JOB_ID)

    expect(cancelByID).not.toHaveBeenCalled()
    expect(publishMock).not.toHaveBeenCalled()
  })

  it('does nothing when the job is already processing', async () => {
    findByID.mockResolvedValue({
      id: JOB_ID,
      processing: true,
      completedAt: null,
      hasError: false,
    })

    await cancelScheduledJob(JOB_ID)

    expect(cancelByID).not.toHaveBeenCalled()
  })

  it('does nothing when the job has already completed', async () => {
    findByID.mockResolvedValue({
      id: JOB_ID,
      processing: false,
      completedAt: '2026-01-01T12:00:00.000Z',
      hasError: false,
    })

    await cancelScheduledJob(JOB_ID)

    expect(cancelByID).not.toHaveBeenCalled()
  })

  it('does nothing when the job has already errored', async () => {
    findByID.mockResolvedValue({
      id: JOB_ID,
      processing: false,
      completedAt: null,
      hasError: true,
    })

    await cancelScheduledJob(JOB_ID)

    expect(cancelByID).not.toHaveBeenCalled()
  })

  it('logs rather than throws when cancelByID fails', async () => {
    cancelByID.mockRejectedValue(new Error('boom'))

    await expect(cancelScheduledJob(JOB_ID)).resolves.toBeUndefined()

    expect(logError).toHaveBeenCalledTimes(1)
    expect(logError.mock.calls[0][0]).toContain('boom')
  })

  it('publishes an error message on the job channel when cancelByID fails', async () => {
    cancelByID.mockRejectedValue(new Error('boom'))

    await cancelScheduledJob(JOB_ID)

    expect(publishMock).toHaveBeenCalledTimes(1)
    expect(publishMock).toHaveBeenCalledWith(scheduledJobChannel(JOB_ID), {
      status: 'error',
      message: 'boom',
    })
  })
})
