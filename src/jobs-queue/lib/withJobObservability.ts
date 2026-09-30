import type { TaskConfig, WorkflowConfig } from 'payload'

import * as Sentry from '@sentry/nextjs'

/**
 * Wraps a task's or workflow's handler with Sentry span + exception
 * instrumentation.
 *
 * Every entry in `TASKS` and `WORKFLOWS` is passed through this (see
 * {@link ../tasks/index.ts} and {@link ../workflows/index.ts}), so nothing
 * can be registered without it — there is no per-task/per-workflow opt-in to
 * forget. Payload's own `TaskError`/`WorkflowError` wrapper only preserves
 * `err.message` when a handler throws, discarding the original stack; this
 * wrapper captures the real error (with stack, slug and job id) via
 * `Sentry.captureException` *before* Payload gets a chance to swallow it, and
 * binds the execution to a span so it shows up in trace views rather than
 * only as an isolated error event.
 *
 * A task called via `tasks.X()` from inside another task's or a workflow's
 * handler goes through the same wrapped config — Payload resolves it from
 * `req.payload.config.jobs.tasks`, which is the wrapped `TASKS` array — so
 * nested calls are covered automatically, with no extra wrapping needed at
 * the call site.
 *
 * `string`-path handlers (Payload's alternative to inline functions, used to
 * keep a task's/workflow's dependencies out of the Next.js app) pass through
 * unwrapped here, because Payload only resolves them at run time. Their
 * modules wrap themselves with {@link wrapHandler} instead — see
 * `src/jobs-queue/handlers/`.
 */
// TaskHandler and WorkflowHandler have incompatible arg/return shapes (and
// WorkflowConfig's handler can also be a WorkflowJSON step array, not just a
// function) — a shared wrapper can't express the union precisely, so the
// runtime logic below is typed loosely and the public signature (`T extends
// TaskConfig<string> | WorkflowConfig<string>`, returning `T`) is what keeps
// call sites — TASKS.map(withJobObservability), WORKFLOWS.map(...) — exact.
type LooseJobConfig = {
  slug: string
  handler:
    | string
    | ((args: {
        input?: unknown
        job: {
          id: unknown
          taskSlug?: string
          workflowSlug?: string
        }
      }) => unknown)
}

// TaskConfig/WorkflowConfig are generic over their own literal slug type,
// which differs per array element — `AnySlug` is what lets a single wrapper
// apply across every task and workflow without forcing each one's exact slug
// type into the signature.
// biome-ignore lint/suspicious/noExplicitAny: see above
type AnySlug = any

/**
 * Instruments one handler function. Used for inline handlers (through
 * {@link withJobObservability}) and by every module in `src/jobs-queue/handlers/`,
 * whose handler Payload loads from a path.
 */
export const wrapHandler = <H extends (args: never) => unknown>(
  fallbackSlug: string,
  handler: H,
): H => {
  const inner = handler as unknown as NonNullable<Exclude<LooseJobConfig['handler'], string>>

  const wrapped: typeof inner = async (args) => {
    const { job } = args
    const jobSlug = String(job.taskSlug ?? job.workflowSlug ?? fallbackSlug)
    const kind = job.taskSlug ? 'task' : 'workflow'

    return Sentry.startSpan(
      {
        name: `job.${kind}/${jobSlug}`,
        // 'task': Sentry's documented op for background/scheduled work —
        // 'queue.process' is for message-queue consumers, which this isn't.
        op: 'task',
        attributes: {
          'job.id': String(job.id),
          'job.kind': kind,
          'job.slug': jobSlug,
          'job.workflow_slug': job.workflowSlug ? String(job.workflowSlug) : undefined,
        },
      },
      async () => {
        try {
          return await inner(args)
        } catch (err) {
          Sentry.captureException(err, {
            tags: {
              'job.kind': kind,
              'job.slug': jobSlug,
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
  }

  return wrapped as unknown as H
}

export const withJobObservability = <T extends TaskConfig<AnySlug> | WorkflowConfig<AnySlug>>(
  jobConfig: T,
): T => {
  const { handler } = jobConfig as unknown as LooseJobConfig

  if (typeof handler === 'string') {
    return jobConfig
  }

  return {
    ...jobConfig,
    handler: wrapHandler(jobConfig.slug, handler),
  } as unknown as T
}
