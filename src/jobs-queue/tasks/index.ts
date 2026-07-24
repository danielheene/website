import { generateLocalizedResumeDocument } from '@/jobs-queue/tasks/generateLocalizedResumeDocument'
import { TaskSlugValue } from '@/types/jobs-queue'

import { calculateSkillTagInterval } from './calculateSkillTagInterval'
import { generateDocumentThumbnail } from './generateDocumentThumbnail'

export const TASKS = [
  generateDocumentThumbnail,

  calculateSkillTagInterval,
  generateLocalizedResumeDocument,
]

export const TASKS_SLUGS = TASKS.map(({ slug }) => slug) as TaskSlugValue[]
