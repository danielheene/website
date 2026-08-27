import type {
  TypedCollection as RegisteredCollection,
  CollectionSlug as RegisteredCollectionSlug,
} from 'payload'

import type { BilingualLanguage, ReducedToBilingualLanguage } from '@/lib/i18n'
import { ResolvedRelations } from '@/lib/resolveRelation'

export const CollectionSlug = {
  Pages: 'pages',
  BlogPosts: 'posts',
  BlogTopics: 'topics',
  Users: 'users',

  /* Media Upload Collections */
  MediaImages: 'images',
  MediaVideos: 'videos',
  MediaDocuments: 'documents',
  MediaAudios: 'audios',

  /* Resume Collections */
  ResumeCustomers: 'resume-customers',
  ResumeDocuments: 'resume-documents',
  ResumeJobs: 'resume-jobs',
  ResumeProjects: 'resume-projects',
  ResumeSkills: 'resume-skills',
  ResumeSkillTags: 'resume-skill-tags',

  /* Bookkeeping */
  DocumentReferences: 'document-references',
  Redirects: 'redirects',

  /* Payload Internal Collections */
  PayloadExports: 'payload-exports',
  PayloadFolders: 'payload-folders',
  PayloadImports: 'payload-imports',
  PayloadJobs: 'payload-jobs',
  PayloadKVS: 'payload-kvs',
  PayloadLockedDocuments: 'payload-locked-documents',
  PayloadMigrations: 'payload-migrations',
  PayloadPreferences: 'payload-preferences',
  PayloadQueryPresets: 'payload-query-presets',
} as const

export type CollectionSlug = typeof CollectionSlug
export type CollectionSlugKey = keyof CollectionSlug & string
export type CollectionSlugValue = CollectionSlug[CollectionSlugKey] & string

export type MediaCollectionSlug =
  | CollectionSlug['MediaImages']
  | CollectionSlug['MediaDocuments']
  | CollectionSlug['MediaVideos']
  | CollectionSlug['MediaAudios']

export const COLLECTION_PREFIX_MAP: Partial<Record<CollectionSlugValue, string>> = {
  [CollectionSlug.Pages]: '',
  [CollectionSlug.BlogTopics]: 'blog',
  [CollectionSlug.BlogPosts]: 'blog/post',
  [CollectionSlug.ResumeDocuments]: 'resume',
} as const

export type {
  CollectionSlug as RegisteredCollectionSlug,
  TypedCollection as RegisteredCollection,
  TypedCollectionSelect,
} from 'payload'
export type CollectionData<
  T extends RegisteredCollectionSlug = RegisteredCollectionSlug,
  L extends BilingualLanguage = 'en',
> = ReducedToBilingualLanguage<ResolvedRelations<RegisteredCollection[T]>, L>
