import { autoTranslateBilingualField } from './autoTranslateBilingualField'
import { buildLocalizedResumeData } from './buildLocalizedResumeData'
import { calculateSkillTagInterval } from './calculateSkillTagInterval'
import { calculateSkillTagType } from './calculateSkillTagType'
import { createResumeDocument } from './createResumeDocument'
import { generateBlogPostExcerpt } from './generateBlogPostExcerpt'
import { generateDocumentThumbnails } from './generateDocumentThumbnails'
import { generateLocalizedResumeDocument } from './generateLocalizedResumeDocument'
import { generateResumeDocumentTitle } from './generateResumeDocumentTitle'
import { generateResumeFile } from './generateResumeFile'
import { generateResumeFilename } from './generateResumeFilename'
import { generateVideoThumbnails } from './generateVideoThumbnails'
import { heartbeatCleanup } from './heartbeatCleanup'
import { heartbeatPing } from './heartbeatPing'
import { seedCollection } from './seedCollection'
import { syncSkillSorting } from './syncSkillSorting'

export const TASKS = [
  generateDocumentThumbnails,
  generateVideoThumbnails,
  calculateSkillTagInterval,
  calculateSkillTagType,
  generateBlogPostExcerpt,
  generateLocalizedResumeDocument,
  generateResumeFilename,
  buildLocalizedResumeData,
  generateResumeFile,
  autoTranslateBilingualField,
  generateResumeDocumentTitle,
  createResumeDocument,
  heartbeatCleanup,
  heartbeatPing,
  seedCollection,
  syncSkillSorting,
]
