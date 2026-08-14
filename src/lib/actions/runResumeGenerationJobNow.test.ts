import { getPayload } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { runResumeGenerationJobNow } from './runResumeGenerationJobNow'

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
const runByID = vi.fn(async () => ({}))
const logError = vi.fn()

/**
 * `getPayload` is stubbed globally in vitest.setup.ts with a fixed shape;
 * this module needs `findByID` and `jobs.runByID` under per-test control.
 */
beforeEach(() => {
  findByID.mockClear()
  findByID.mockResolvedValue({
    id: JOB_ID,
    processing: false,
    completedAt: null,
    hasError: false,
  })
  runByID.mockClear()
  logError.mockClear()

  vi.mocked(getPayload).mockResolvedValue({
    findByID,
    jobs: {
      runByID,
    },
    logger: {
      info: vi.fn(),
      error: logError,
    },
  } as never)
})

describe('runResumeGenerationJobNow', () => {
  it('runs a still-pending job immediately', async () => {
    await runResumeGenerationJobNow(JOB_ID)

    expect(runByID).toHaveBeenCalledTimes(1)
    expect(runByID).toHaveBeenCalledWith({
      id: JOB_ID,
    })
  })

  it('does nothing when the job no longer exists', async () => {
    findByID.mockResolvedValue(null)

    await runResumeGenerationJobNow(JOB_ID)

    expect(runByID).not.toHaveBeenCalled()
  })

  it('does nothing when the job is already processing', async () => {
    findByID.mockResolvedValue({
      id: JOB_ID,
      processing: true,
      completedAt: null,
      hasError: false,
    })

    await runResumeGenerationJobNow(JOB_ID)

    expect(runByID).not.toHaveBeenCalled()
  })

  it('does nothing when the job has already completed', async () => {
    findByID.mockResolvedValue({
      id: JOB_ID,
      processing: false,
      completedAt: '2026-01-01T12:00:00.000Z',
      hasError: false,
    })

    await runResumeGenerationJobNow(JOB_ID)

    expect(runByID).not.toHaveBeenCalled()
  })

  it('does nothing when the job has errored', async () => {
    findByID.mockResolvedValue({
      id: JOB_ID,
      processing: false,
      completedAt: null,
      hasError: true,
    })

    await runResumeGenerationJobNow(JOB_ID)

    expect(runByID).not.toHaveBeenCalled()
  })

  it('logs rather than throws when runByID fails', async () => {
    runByID.mockRejectedValue(new Error('boom'))

    await expect(runResumeGenerationJobNow(JOB_ID)).resolves.toBeUndefined()

    expect(logError).toHaveBeenCalledTimes(1)
    expect(logError.mock.calls[0][0]).toContain('boom')
  })
})
