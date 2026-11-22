import type { TaskConfig } from 'payload'

import {
  documentTaskConcurrency,
  documentTaskInputSchema,
} from '@/jobs-queue/lib/documentTaskConfig'
import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

/** Interval (from published jobs) and/or type (from published skills) of a skill tag. */
export const calculateSkillTag: TaskConfig<TaskSlug['CalculateSkillTag']> = {
  slug: TaskSlug.CalculateSkillTag,
  label: 'Calculate Skill Tag',
  retries: 2,
  concurrency: documentTaskConcurrency(TaskSlug.CalculateSkillTag),
  inputSchema: documentTaskInputSchema(TaskSlug.CalculateSkillTag),
  outputSchema: [
    {
      name: 'interval',
      type: 'number',
    },
    {
      name: 'type',
      type: 'text',
    },
  ],
  handler: handlerPath('calculateSkillTag.ts'),
}
