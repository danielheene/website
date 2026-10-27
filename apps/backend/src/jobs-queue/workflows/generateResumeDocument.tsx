import type { WorkflowConfig } from 'payload'

import { QueueSlug, WorkflowSlug } from '@website/types/jobs-queue'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'

/**
 * Generate a resume document in both languages
 *
 * `supersedes` keeps one run active; each step is its own task so failures
 * surface with that task's slug. `customId` (from `generateResumeId`) is the
 * document slug. Steps live in `handlers/generateResumeDocument.tsx`.
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
