import { withTaskObservability } from '@/jobs-queue/lib/withTaskObservability'
import { TaskSlugValue } from '@/types/jobs-queue'

import { buildLocalizedResumeData } from './buildLocalizedResumeData'
import { calculateSkillTagInterval } from './calculateSkillTagInterval'
import { generateDocumentThumbnails } from './generateDocumentThumbnails'
import { generateLocalizedResumeDocument } from './generateLocalizedResumeDocument'
import { generateResumeFile } from './generateResumeFile'
import { generateResumeFilename } from './generateResumeFilename'
import { generateVideoThumbnails } from './generateVideoThumbnails'
import { pingUptimeEndpoint } from './pingUptimeEndpoint'

// Every task is wrapped in withTaskObservability here, at the single point
// where tasks are registered — a task added to this array cannot skip Sentry
// span/exception instrumentation, unlike a per-task opt-in that's easy to
// forget on a new file.
export const TASKS = [
  generateDocumentThumbnails,
  generateVideoThumbnails,
  calculateSkillTagInterval,
  generateLocalizedResumeDocument,
  generateResumeFilename,
  buildLocalizedResumeData,
  generateResumeFile,
  pingUptimeEndpoint,
].map(withTaskObservability)

export const TASKS_SLUGS = TASKS.map(({ slug }) => slug) as TaskSlugValue[]
