import type { TaskConfig } from 'payload'

import { TaskSlug } from '@website/types/jobs-queue'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'

export const calculateSkillTagInterval: TaskConfig<TaskSlug['CalculateSkillTagInterval']> = {
  slug: TaskSlug.CalculateSkillTagInterval,
  label: 'Generate Skill Tag Interval',
  retries: 2,
  concurrency: {
    key: ({ input: { skillTagId } }) => `${TaskSlug.CalculateSkillTagInterval}:${skillTagId}`,
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
      name: 'interval',
      type: 'number',
    },
  ],
  handler: handlerPath('calculateSkillTagInterval.ts'),
}
