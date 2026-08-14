import { TaskSlugValue } from '@/types/jobs-queue'

import { buildLocalizedResumeData } from './buildLocalizedResumeData'
import { calculateSkillTagInterval } from './calculateSkillTagInterval'
import { generateDocumentThumbnails } from './generateDocumentThumbnails'
import { generateLocalizedResumeDocument } from './generateLocalizedResumeDocument'
import { generateResumeFile } from './generateResumeFile'
import { generateResumeFilename } from './generateResumeFilename'
import { generateVideoThumbnails } from './generateVideoThumbnails'
import { pingUptimeEndpoint } from './pingUptimeEndpoint'

export const TASKS = [
  generateDocumentThumbnails,
  generateVideoThumbnails,
  calculateSkillTagInterval,
  generateLocalizedResumeDocument,
  generateResumeFilename,
  buildLocalizedResumeData,
  generateResumeFile,
  pingUptimeEndpoint,
]

export const TASKS_SLUGS = TASKS.map(({ slug }) => slug) as TaskSlugValue[]
