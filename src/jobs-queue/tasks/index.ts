import { TaskSlugValue } from '@/types/jobs-queue'

import { calculateSkillTagInterval } from './calculateSkillTagInterval'
import { generateDocumentThumbnails } from './generateDocumentThumbnails'
import { generateLocalizedResumeDocument } from './generateLocalizedResumeDocument'
import { generateVideoThumbnails } from './generateVideoThumbnails'
import { pingUptimeEndpoint } from './pingUptimeEndpoint'

export const TASKS = [
  generateDocumentThumbnails,
  generateVideoThumbnails,
  calculateSkillTagInterval,
  generateLocalizedResumeDocument,
  pingUptimeEndpoint,
]

export const TASKS_SLUGS = TASKS.map(({ slug }) => slug) as TaskSlugValue[]
