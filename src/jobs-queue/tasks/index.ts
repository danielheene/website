import { generateLocalizedResumeDocument } from '@/jobs-queue/tasks/generateLocalizedResumeDocument'
import { TaskSlugValue } from '@/types/jobs-queue'

import { calculateSkillTagInterval } from './calculateSkillTagInterval'
import { generateDocumentThumbnails } from './generateDocumentThumbnails'

export const TASKS = [
  generateDocumentThumbnails,
  calculateSkillTagInterval,
  generateLocalizedResumeDocument,
]

export const TASKS_SLUGS = TASKS.map(({ slug }) => slug) as TaskSlugValue[]
