import { WorkflowSlugValue } from '@/types/jobs-queue'

import { generateResumeDocument } from './generateResumeDocument'

export const WORKFLOWS = [
  generateResumeDocument,
]

export const WORKFLOW_SLUGS = WORKFLOWS.map((workflow) => workflow.slug) as WorkflowSlugValue[]
