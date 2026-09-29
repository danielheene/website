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
const update = vi.fn(async () => ({}))
const logError = vi.fn()
const publishMock = vi.fn()

vi.mock('@/lib/RedisHandler', () => ({
  publish: (...args: unknown[]) => publishMock(...args),
}))

const { runScheduledJobNow } = await import('./runScheduledJobNow')

/**
 * `getPayload` is stubbed globally in vitest.setup.ts with a fixed shape;
 * this module needs `findByID` and `update` under per-test control.
 */
beforeEach(() => {
  findByID.mockClear()
  findByID.mockResolvedValue({
    id: JOB_ID,
    processing: false,
    completedAt: null,
    hasError: false,
  })
  update.mockClear()
  update.mockResolvedValue({})
  logError.mockClear()
  publishMock.mockClear()

  vi.mocked(getPayload).mockResolvedValue({
    findByID,
    update,
    logger: {
      info: vi.fn(),
      error: logError,
    },
  } as never)
})

describe('runScheduledJobNow', () => {
  it('makes a still-pending job due now so the worker runs it', async () => {
    await runScheduledJobNow(JOB_ID)

    expect(update).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith({
      collection: 'payload-jobs',
      id: JOB_ID,
      data: {
        waitUntil: expect.any(String),
      },
    })
  })

  it('publishes a success message on the job channel once the job is due', async () => {
    await runScheduledJobNow(JOB_ID)

    expect(publishMock).toHaveBeenCalledTimes(1)
    expect(publishMock).toHaveBeenCalledWith(scheduledJobChannel(JOB_ID), {
      status: 'success',
    })
  })

  it('does nothing when the job no longer exists', async () => {
    findByID.mockResolvedValue(null)

    await runScheduledJobNow(JOB_ID)

    expect(update).not.toHaveBeenCalled()
    expect(publishMock).not.toHaveBeenCalled()
  })

  it('does nothing when the job is already processing', async () => {
    findByID.mockResolvedValue({
      id: JOB_ID,
      processing: true,
      completedAt: null,
      hasError: false,
    })

    await runScheduledJobNow(JOB_ID)

    expect(update).not.toHaveBeenCalled()
  })

  it('does nothing when the job has already completed', async () => {
    findByID.mockResolvedValue({
      id: JOB_ID,
      processing: false,
      completedAt: '2026-01-01T12:00:00.000Z',
      hasError: false,
    })

    await runScheduledJobNow(JOB_ID)

    expect(update).not.toHaveBeenCalled()
  })

  it('does nothing when the job has errored', async () => {
    findByID.mockResolvedValue({
      id: JOB_ID,
      processing: false,
      completedAt: null,
      hasError: true,
    })

    await runScheduledJobNow(JOB_ID)

    expect(update).not.toHaveBeenCalled()
  })

  it('logs rather than throws when the update fails', async () => {
    update.mockRejectedValue(new Error('boom'))

    await expect(runScheduledJobNow(JOB_ID)).resolves.toBeUndefined()

    expect(logError).toHaveBeenCalledTimes(1)
    expect(logError.mock.calls[0][0]).toContain('boom')
  })

  it('publishes an error message on the job channel when the update fails', async () => {
    update.mockRejectedValue(new Error('boom'))

    await runScheduledJobNow(JOB_ID)

    expect(publishMock).toHaveBeenCalledTimes(1)
    expect(publishMock).toHaveBeenCalledWith(scheduledJobChannel(JOB_ID), {
      status: 'error',
      message: 'boom',
    })
  })
})
