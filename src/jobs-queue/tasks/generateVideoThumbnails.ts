import type { TaskConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

/**
 * Extracts poster frames from a video and stores them as images, mirroring
 * `generateDocumentThumbnails`.
 *
 * Running this as a task rather than an afterChange hook keeps the upload
 * request fast, gives frame decoding retries, and lets the exclusive
 * concurrency key collapse repeated saves of the same video into one run.
 */

export const generateVideoThumbnails: TaskConfig<TaskSlug['GenerateVideoThumbnails']> = {
  slug: TaskSlug.GenerateVideoThumbnails,
  label: 'Generate Video Thumbnails',
  retries: 3,
  concurrency: {
    key: ({ input }) => `${TaskSlug.GenerateVideoThumbnails}:${input.videoId}`,
    exclusive: true,
    supersedes: true,
  },
  inputSchema: [
    {
      name: 'videoId',
      type: 'text',
      required: true,
    },
    {
      name: 'timestampInSeconds',
      type: 'number',
      defaultValue: 0,
    },
  ],
  outputSchema: [
    {
      name: 'thumbnailIDs',
      type: 'text',
      hasMany: true,
    },
  ],
  handler: handlerPath('generateVideoThumbnails.ts'),
}
