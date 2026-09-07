import type { BaseFilter } from 'payload'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { STALLED_AFTER_MS } from '@/jobs-queue/lib/checkJobsHealth'
import { QueueSlug } from '@/types/jobs-queue'

import {
  JOBS_QUEUE_PARAM,
  JOBS_STATE_PARAM,
  JobState,
  resolveJobQueue,
  resolveJobState,
  scopeJobsList,
} from './jobsListFilter'

type BaseFilterArgs = Parameters<BaseFilter>[0]

const withQuery = (query: Record<string, unknown>) =>
  ({
    req: {
      query,
    },
  }) as unknown as BaseFilterArgs

describe('resolveJobQueue', () => {
  it('passes through every known queue', () => {
    for (const queue of Object.values(QueueSlug)) {
      expect(resolveJobQueue(queue)).toBe(queue)
    }
  })

  it('falls back to null for absent, unknown, or non-string values', () => {
    for (const value of [
      undefined,
      null,
      '',
      'nope',
      [
        QueueSlug.Default,
      ],
      1,
      true,
    ]) {
      expect(resolveJobQueue(value)).toBeNull()
    }
  })
})

describe('resolveJobState', () => {
  it('passes through every known state', () => {
    for (const state of Object.values(JobState)) {
      expect(resolveJobState(state)).toBe(state)
    }
  })

  it('falls back to null for absent, unknown, or non-string values', () => {
    for (const value of [
      undefined,
      null,
      '',
      'nope',
      1,
      true,
    ]) {
      expect(resolveJobState(value)).toBeNull()
    }
  })
})

describe('scopeJobsList', () => {
  it('excludes the heartbeat queue when no queue is selected', () => {
    expect(scopeJobsList(withQuery({}))).toEqual({
      queue: {
        not_equals: QueueSlug.Heartbeat,
      },
    })
  })

  it('filters by queue alone, including heartbeat when selected explicitly', () => {
    expect(
      scopeJobsList(
        withQuery({
          [JOBS_QUEUE_PARAM]: QueueSlug.ResumeGeneration,
        }),
      ),
    ).toEqual({
      queue: {
        equals: QueueSlug.ResumeGeneration,
      },
    })

    expect(
      scopeJobsList(
        withQuery({
          [JOBS_QUEUE_PARAM]: QueueSlug.Heartbeat,
        }),
      ),
    ).toEqual({
      queue: {
        equals: QueueSlug.Heartbeat,
      },
    })
  })

  it('filters completed jobs, still excluding heartbeat by default', () => {
    expect(
      scopeJobsList(
        withQuery({
          [JOBS_STATE_PARAM]: JobState.Completed,
        }),
      ),
    ).toEqual({
      and: [
        {
          queue: {
            not_equals: QueueSlug.Heartbeat,
          },
        },
        {
          completedAt: {
            exists: true,
          },
        },
      ],
    })
  })

  it('filters failed jobs, still excluding heartbeat by default', () => {
    expect(
      scopeJobsList(
        withQuery({
          [JOBS_STATE_PARAM]: JobState.Failed,
        }),
      ),
    ).toEqual({
      and: [
        {
          queue: {
            not_equals: QueueSlug.Heartbeat,
          },
        },
        {
          hasError: {
            equals: true,
          },
        },
      ],
    })
  })

  it('filters pending jobs to neither completed nor errored, still excluding heartbeat by default', () => {
    expect(
      scopeJobsList(
        withQuery({
          [JOBS_STATE_PARAM]: JobState.Pending,
        }),
      ),
    ).toEqual({
      and: [
        {
          queue: {
            not_equals: QueueSlug.Heartbeat,
          },
        },
        {
          and: [
            {
              completedAt: {
                exists: false,
              },
            },
            {
              hasError: {
                not_equals: true,
              },
            },
          ],
        },
      ],
    })
  })

  describe('stale jobs', () => {
    const now = new Date('2026-01-01T00:00:00.000Z')

    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(now)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('filters to pending jobs overdue past the stalled threshold', () => {
      expect(
        scopeJobsList(
          withQuery({
            [JOBS_STATE_PARAM]: JobState.Stale,
          }),
        ),
      ).toEqual({
        and: [
          {
            queue: {
              not_equals: QueueSlug.Heartbeat,
            },
          },
          {
            and: [
              {
                completedAt: {
                  exists: false,
                },
              },
              {
                hasError: {
                  not_equals: true,
                },
              },
              {
                waitUntil: {
                  less_than: new Date(now.getTime() - STALLED_AFTER_MS).toISOString(),
                },
              },
            ],
          },
        ],
      })
    })
  })

  it('combines queue and state into their intersection', () => {
    expect(
      scopeJobsList(
        withQuery({
          [JOBS_QUEUE_PARAM]: QueueSlug.Default,
          [JOBS_STATE_PARAM]: JobState.Failed,
        }),
      ),
    ).toEqual({
      and: [
        {
          queue: {
            equals: QueueSlug.Default,
          },
        },
        {
          hasError: {
            equals: true,
          },
        },
      ],
    })
  })

  it('treats an unknown queue as unselected (excludes heartbeat) and ignores an unknown state', () => {
    expect(
      scopeJobsList(
        withQuery({
          [JOBS_QUEUE_PARAM]: 'nope',
          [JOBS_STATE_PARAM]: 'nope',
        }),
      ),
    ).toEqual({
      queue: {
        not_equals: QueueSlug.Heartbeat,
      },
    })
  })
})
