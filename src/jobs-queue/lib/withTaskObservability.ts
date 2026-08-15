import type { TaskConfig } from 'payload'

import * as Sentry from '@sentry/nextjs'

/**
 * Wraps a task's handler with Sentry span + exception instrumentation.
 *
 * Every task is passed through this in {@link ./index.ts} (`TASKS`), so a
 * task cannot be registered without it — there is no per-task opt-in to
 * forget. Payload's own `TaskError` wrapper only preserves `err.message`
 * when a task handler throws, discarding the original stack; this wrapper
 * captures the real error (with stack, task slug and job id) via
 * `Sentry.captureException` *before* Payload gets a chance to swallow it,
 * and binds the task's execution to a span so it shows up in trace views
 * rather than only as an isolated error event.
 *
 * `string`-path handlers (Payload's alternative to inline functions, used to
 * avoid bundling a task's dependencies into the Next.js app) pass through
 * unwrapped — there is nothing to instrument until Payload resolves them.
 */
export const withTaskObservability = <T extends TaskConfig<never>>(taskConfig: T): T => {
  const { handler } = taskConfig

  if (typeof handler === 'string') {
    return taskConfig
  }

  return {
    ...taskConfig,
    handler: async (args) => {
      const { job } = args
      const taskSlug = String(job.taskSlug ?? taskConfig.slug)

      return Sentry.startSpan(
        {
          name: `job.task/${taskSlug}`,
          op: 'queue.task',
          attributes: {
            'job.id': String(job.id),
            'job.task_slug': taskSlug,
            'job.workflow_slug': job.workflowSlug ? String(job.workflowSlug) : undefined,
          },
        },
        async () => {
          try {
            return await handler(args)
          } catch (err) {
            Sentry.captureException(err, {
              tags: {
                'job.task_slug': taskSlug,
              },
              extra: {
                jobId: job.id,
                workflowSlug: job.workflowSlug,
                input: args.input,
              },
            })
            throw err
          }
        },
      )
    },
  }
}
