import { describe, expect, it, vi } from 'vitest'

const { startSpan, captureException } = vi.hoisted(() => ({
  startSpan: vi.fn(async (_options: unknown, callback: () => unknown) => callback()),
  captureException: vi.fn(),
}))

vi.mock('@sentry/nextjs', () => ({
  startSpan,
  captureException,
}))

import { withTaskObservability } from './withTaskObservability'

// biome-ignore lint/suspicious/noExplicitAny: TaskConfig<T>'s handler/job types are too broad to model exactly in a unit test
const makeTaskConfig = (handler: (args: any) => Promise<any>): any => ({
  slug: 'SomeTask',
  handler,
})

const makeArgs = (overrides: Record<string, unknown> = {}) => ({
  job: {
    id: 'job-1',
    taskSlug: 'SomeTask',
    workflowSlug: undefined,
  },
  input: {
    foo: 'bar',
  },
  ...overrides,
})

describe('withTaskObservability', () => {
  it('passes string-path handlers through unwrapped', () => {
    const taskConfig = {
      slug: 'SomeTask',
      handler: '@/some/path#handler',
    }

    // biome-ignore lint/suspicious/noExplicitAny: exercising the string-handler branch
    const wrapped = withTaskObservability(taskConfig as any)

    expect(wrapped.handler).toBe('@/some/path#handler')
    expect(startSpan).not.toHaveBeenCalled()
  })

  it('runs the handler inside a Sentry span named after the task slug', async () => {
    const handler = vi.fn(async () => ({
      output: {
        result: 'ok',
      },
    }))
    const wrapped = withTaskObservability(makeTaskConfig(handler))

    // biome-ignore lint/suspicious/noExplicitAny: TaskConfig<T>'s handler type is too broad here
    const result = await (wrapped.handler as any)(makeArgs())

    expect(result).toEqual({
      output: {
        result: 'ok',
      },
    })
    expect(startSpan).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'job.task/SomeTask',
        op: 'queue.task',
        attributes: expect.objectContaining({
          'job.id': 'job-1',
          'job.task_slug': 'SomeTask',
        }),
      }),
      expect.any(Function),
    )
    expect(handler).toHaveBeenCalled()
    expect(captureException).not.toHaveBeenCalled()
  })

  it('captures the exception with task context and rethrows on failure', async () => {
    const failure = new Error('boom')
    const handler = vi.fn(async () => {
      throw failure
    })
    const wrapped = withTaskObservability(makeTaskConfig(handler))

    await expect(
      // biome-ignore lint/suspicious/noExplicitAny: TaskConfig<T>'s handler type is too broad here
      (wrapped.handler as any)(makeArgs()),
    ).rejects.toThrow('boom')

    expect(captureException).toHaveBeenCalledWith(
      failure,
      expect.objectContaining({
        tags: expect.objectContaining({
          'job.task_slug': 'SomeTask',
        }),
        extra: expect.objectContaining({
          jobId: 'job-1',
          input: {
            foo: 'bar',
          },
        }),
      }),
    )
  })
})
