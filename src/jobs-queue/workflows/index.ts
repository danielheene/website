import { withJobObservability } from '@/jobs-queue/lib/withJobObservability'
import { WorkflowSlugValue } from '@/types/jobs-queue'

import { generateResumeDocument } from './generateResumeDocument'

// Every workflow is wrapped in withJobObservability here, at the single point
// where workflows are registered — see src/jobs-queue/tasks/index.ts for the
// same pattern applied to TASKS.
export const WORKFLOWS = [
  generateResumeDocument,
].map(withJobObservability)

export const WORKFLOW_SLUGS = WORKFLOWS.map((workflow) => workflow.slug) as WorkflowSlugValue[]
