import type { TaskConfig } from 'payload'

import { TaskSlug } from '@website/types/jobs-queue'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'

/**
 * Generate one localized resume document
 *
 * Each step is its own top-level task so a crash surfaces with that task's
 * slug; the rendered PDF buffer never crosses task input/output and stays
 * local to GenerateResumeFile. Steps run in
 * `handlers/generateLocalizedResumeDocument.tsx`.
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
