import { generateDocumentThumbnail } from './generateDocumentThumbnail'
import { generateResumeLocalizedData } from './generateResumeLocalizedData'
import { generateResumeDocument } from './generateResumeDocument'
import { TaskSlugValue } from '@/types/jobs-queue'

export const TASKS = [
  generateDocumentThumbnail,
  generateResumeLocalizedData,
  generateResumeDocument,
]

export const TASKS_SLUGS = TASKS.map(({ slug }) => slug) as TaskSlugValue[]
