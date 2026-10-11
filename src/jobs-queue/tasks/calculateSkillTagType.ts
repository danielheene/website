import type { TaskConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

export const calculateSkillTagType: TaskConfig<TaskSlug['CalculateSkillTagType']> = {
  slug: TaskSlug.CalculateSkillTagType,
  label: 'Resolve Skill Tag Type',
  retries: 2,
  concurrency: {
    key: ({ input: { skillTagId } }) => `${TaskSlug.CalculateSkillTagType}:${skillTagId}`,
    supersedes: true,
  },
  inputSchema: [
    {
      name: 'skillTagId',
      type: 'text',
      required: true,
    },
  ],
  outputSchema: [
    {
      name: 'type',
      type: 'text',
    },
  ],
  handler: handlerPath('calculateSkillTagType.ts'),
}
