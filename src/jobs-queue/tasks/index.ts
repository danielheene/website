import { withJobObservability } from '@/jobs-queue/lib/withJobObservability'
import { TaskSlugValue } from '@/types/jobs-queue'

import { buildLocalizedResumeData } from './buildLocalizedResumeData'
import { calculateSkillTagInterval } from './calculateSkillTagInterval'
import { createResumeDocument } from './createResumeDocument'
import { generateDocumentThumbnails } from './generateDocumentThumbnails'
import { generateLocalizedResumeDocument } from './generateLocalizedResumeDocument'
import { generateResumeDocumentSlug } from './generateResumeDocumentSlug'
import { generateResumeDocumentTitle } from './generateResumeDocumentTitle'
import { generateResumeFile } from './generateResumeFile'
import { generateResumeFilename } from './generateResumeFilename'
import { generateVideoThumbnails } from './generateVideoThumbnails'
import { pingUptimeEndpoint } from './pingUptimeEndpoint'

// Every task is wrapped in withJobObservability here, at the single point
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
  generateResumeDocumentTitle,
  generateResumeDocumentSlug,
  createResumeDocument,
  pingUptimeEndpoint,
].map(withJobObservability)

export const TASKS_SLUGS = TASKS.map(({ slug }) => slug) as TaskSlugValue[]
