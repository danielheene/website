import { TaskConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

/**
 * Orchestrates the steps needed to generate one localized resume document.
 * Each step below is its own top-level task (own slug, own file) rather than
 * an inline sub-step here — a crash surfaces with the specific task's slug
 * instead of collapsing into one large handler, and no task passes a large
 * blob (the rendered PDF buffer) through its input/output; that stays local
 * to GenerateResumeFile.
 */

export const generateLocalizedResumeDocument: TaskConfig<
  TaskSlug['GenerateLocalizedResumeDocument']
> = {
  slug: TaskSlug.GenerateLocalizedResumeDocument,
  label: 'Generate ResumeDocument for BilingualLanguage',
  retries: 3,
  concurrency: {
    key: ({ input }) =>
      `${TaskSlug.GenerateLocalizedResumeDocument}:${input.customId}:${input.locale}`,
    exclusive: true,
  },
  inputSchema: [
    {
      type: 'text',
      name: 'locale',
      required: true,
      typescriptSchema: [
        () => ({
          type: 'string',
          enum: ['en', 'de'],
          required: true,
        }),
      ],
    },
    {
      type: 'text',
      name: 'customId',
      required: true,
    },
    {
      type: 'text',
      name: 'filenameTemplate',
      required: true,
    },
    {
      type: 'date',
      name: 'createdAt',
      required: true,
    },
    {
      type: 'text',
      name: 'documentSlug',
      required: true,
    },
  ],
  outputSchema: [
    {
      type: 'text',
      name: 'resumeFileId',
      required: true,
    },
    {
      type: 'text',
      name: 'resumeFileChecksum',
      required: true,
    },
    {
      type: 'text',
      name: 'resumeThumbnailIds',
      required: true,
      hasMany: true,
    },
    {
      type: 'json',
      name: 'resumeDocumentData',
      required: true,
    },
  ],
  handler: handlerPath('generateLocalizedResumeDocument.tsx'),
}
