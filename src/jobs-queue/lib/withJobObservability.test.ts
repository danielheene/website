import { describe, expect, it, vi } from 'vitest'

const { startSpan, captureException } = vi.hoisted(() => ({
  startSpan: vi.fn(async (_options: unknown, callback: () => unknown) => callback()),
  captureException: vi.fn(),
}))

vi.mock('@sentry/nextjs', () => ({
  startSpan,
  captureException,
}))

import { withJobObservability } from './withJobObservability'

// biome-ignore lint/suspicious/noExplicitAny: TaskConfig/WorkflowConfig's handler/job types are too broad to model exactly in a unit test
const makeJobConfig = (slug: string, handler: (args: any) => Promise<any>): any => ({
  slug,
  handler,
})

const makeTaskArgs = (overrides: Record<string, unknown> = {}) => ({
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

const makeWorkflowArgs = (overrides: Record<string, unknown> = {}) => ({
  job: {
    id: 'job-2',
    taskSlug: undefined,
    workflowSlug: 'SomeWorkflow',
  },
  input: {
    foo: 'bar',
  },
  ...overrides,
})

describe('withJobObservability', () => {
  it('passes string-path handlers through unwrapped', () => {
    const jobConfig = {
      slug: 'SomeTask',
      handler: '@/some/path#handler',
    }

    // biome-ignore lint/suspicious/noExplicitAny: exercising the string-handler branch
    const wrapped = withJobObservability(jobConfig as any)

    expect(wrapped.handler).toBe('@/some/path#handler')
    expect(startSpan).not.toHaveBeenCalled()
  })

  it('runs a task handler inside a span named job.task/<slug>', async () => {
    const handler = vi.fn(async () => ({
      output: {
        result: 'ok',
      },
    }))
    const wrapped = withJobObservability(makeJobConfig('SomeTask', handler))

    // biome-ignore lint/suspicious/noExplicitAny: TaskConfig's handler type is too broad here
    const result = await (wrapped.handler as any)(makeTaskArgs())

    expect(result).toEqual({
      output: {
        result: 'ok',
      },
    })
    expect(startSpan).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'job.task/SomeTask',
        op: 'task',
        attributes: expect.objectContaining({
          'job.id': 'job-1',
          'job.kind': 'task',
          'job.slug': 'SomeTask',
        }),
      }),
      expect.any(Function),
    )
    expect(handler).toHaveBeenCalled()
    expect(captureException).not.toHaveBeenCalled()
  })

  it('runs a workflow handler inside a span named job.workflow/<slug>', async () => {
    const handler = vi.fn(async () => undefined)
    const wrapped = withJobObservability(makeJobConfig('SomeWorkflow', handler))

    // biome-ignore lint/suspicious/noExplicitAny: WorkflowConfig's handler type is too broad here
    await (wrapped.handler as any)(makeWorkflowArgs())

    expect(startSpan).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'job.workflow/SomeWorkflow',
        op: 'task',
        attributes: expect.objectContaining({
          'job.id': 'job-2',
          'job.kind': 'workflow',
          'job.slug': 'SomeWorkflow',
        }),
      }),
      expect.any(Function),
    )
  })

  it('captures the exception with job context and rethrows on failure', async () => {
    const failure = new Error('boom')
    const handler = vi.fn(async () => {
      throw failure
    })
    const wrapped = withJobObservability(makeJobConfig('SomeTask', handler))

    await expect(
      // biome-ignore lint/suspicious/noExplicitAny: TaskConfig's handler type is too broad here
      (wrapped.handler as any)(makeTaskArgs()),
    ).rejects.toThrow('boom')

    expect(captureException).toHaveBeenCalledWith(
      failure,
      expect.objectContaining({
        tags: expect.objectContaining({
          'job.kind': 'task',
          'job.slug': 'SomeTask',
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
