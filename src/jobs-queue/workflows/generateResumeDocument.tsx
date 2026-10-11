import type { WorkflowConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { QueueSlug, WorkflowSlug } from '@/types/jobs-queue'

/**
 * Generate Resume Document
 *
 * Only one run is active at a time — `supersedes` cancels an older run in
 * favor of a newer one — and each step is its own top-level task (own slug,
 * own file) rather than an inline sub-step here, so a failure surfaces with
 * that task's slug/job-id instead of collapsing into one workflow handler.
 * `customId` is a 5-letter id from `generateResumeId`, used directly as the
 * document's slug. Steps live in `handlers/generateResumeDocument.tsx`.
 */

export const generateResumeDocument: WorkflowConfig<WorkflowSlug['GenerateResumeDocument']> = {
  slug: WorkflowSlug.GenerateResumeDocument,
  concurrency: {
    key: () => WorkflowSlug.GenerateResumeDocument,
    supersedes: true,
    exclusive: true,
  },
  queue: QueueSlug.ResumeGeneration,
  inputSchema: [
    {
      type: 'text',
      name: 'documentTitleTemplate',
      required: true,
    },
    {
      type: 'text',
      name: 'filenameTemplate',
      required: true,
    },
    {
      type: 'text',
      name: 'customId',
      required: true,
    },
    {
      type: 'number',
      name: 'maximumRetries',
      required: true,
    },
  ],
  handler: handlerPath('generateResumeDocument.tsx'),
}
