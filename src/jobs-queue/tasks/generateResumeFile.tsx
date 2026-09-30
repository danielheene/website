import { TaskConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

export const generateResumeFile: TaskConfig<TaskSlug['GenerateResumeFile']> = {
  slug: TaskSlug.GenerateResumeFile,
  label: 'Render and Upload Resume File',
  retries: 3,
  inputSchema: [
    {
      type: 'text',
      name: 'filename',
      required: true,
    },
    {
      type: 'date',
      name: 'createdAt',
      required: true,
    },
    {
      type: 'json',
      name: 'resumeDocumentData',
      required: true,
    },
    {
      // Only used to tag the resume.file.size_bytes metric below — not
      // referenced by rendering or upload.
      type: 'text',
      name: 'locale',
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
  ],
  handler: handlerPath('generateResumeFile.tsx'),
}
