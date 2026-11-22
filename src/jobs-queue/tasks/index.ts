import { autoTranslateBilingualField } from './autoTranslateBilingualField'
import { buildLocalizedResumeData } from './buildLocalizedResumeData'
import { buildRouteIndex } from './buildRouteIndex'
import { calculateReadingTime } from './calculateReadingTime'
import { calculateSkillTag } from './calculateSkillTag'
import { createResumeDocument } from './createResumeDocument'
import { generateBlogPostExcerpt } from './generateBlogPostExcerpt'
import { generateDocumentThumbnails } from './generateDocumentThumbnails'
import { generateLocalizedResumeDocument } from './generateLocalizedResumeDocument'
import { generateMeta } from './generateMeta'
import { generateResumeDocumentTitle } from './generateResumeDocumentTitle'
import { generateResumeFile } from './generateResumeFile'
import { generateResumeFilename } from './generateResumeFilename'
import { generateVideoThumbnails } from './generateVideoThumbnails'
import { heartbeatCleanup } from './heartbeatCleanup'
import { heartbeatPing } from './heartbeatPing'
import { processImage } from './processImage'
import { regenerate } from './regenerate'
import { revalidateDocument } from './revalidateDocument'
import { seedCollection } from './seedCollection'
import { syncReferences } from './syncReferences'
import { syncSkillSorting } from './syncSkillSorting'

export const TASKS = [
  generateDocumentThumbnails,
  generateVideoThumbnails,
  calculateSkillTag,
  calculateReadingTime,
  generateMeta,
  processImage,
  syncReferences,
  revalidateDocument,
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
  buildRouteIndex,
  regenerate,
]
