import type { TaskConfig } from 'payload'

import {
  documentTaskConcurrency,
  documentTaskInputSchema,
} from '@/jobs-queue/lib/documentTaskConfig'
import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

/** Image sizes, blur placeholder and/or Claude alt text of an image, from its stored original. */
export const processImage: TaskConfig<TaskSlug['ProcessImage']> = {
  slug: TaskSlug.ProcessImage,
  label: 'Process Image',
  retries: 2,
  concurrency: documentTaskConcurrency(TaskSlug.ProcessImage),
  inputSchema: documentTaskInputSchema(TaskSlug.ProcessImage),
  outputSchema: [
    {
      name: 'updated',
      type: 'checkbox',
    },
  ],
  handler: handlerPath('processImage.ts'),
}
