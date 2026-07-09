import type { CollectionSlug as RegisteredCollectionSlug, TypedCollection as RegisteredCollection } from 'payload'

import type { Locale, ReducedToLocale } from '@/lib/i18n'
import { ResolvedRelations } from '@/lib/resolveRelation'

export const CollectionSlug = {
  BlogPosts: 'blog-posts',
  BlogTags: 'blog-tags',
  MediaImages: 'images',
  MediaVideos: 'videos',
  MediaDocuments: 'documents',
  MediaAudios: 'audios',
  Pages: 'pages',
  ResumeSkills: 'resume-skills',
  ResumeJobs: 'resume-jobs',
  ResumeDocuments: 'resume-documents',
  ResumeFiles: 'resume-files',
  Users: 'users',

  PayloadFolders: 'payload-folders',
  PayloadExports: 'payload-exports',
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

export const COLLECTION_PREFIX_MAP: Partial<Record<CollectionSlugValue, string>> = {
  [CollectionSlug['Pages']]: '',
  [CollectionSlug['BlogPosts']]: 'posts',
  [CollectionSlug['BlogTags']]: 'tags',
} as const

export type {
  CollectionSlug as RegisteredCollectionSlug,
  TypedCollection as RegisteredCollection,
  TypedCollectionSelect
} from 'payload'
export type CollectionData<
  T extends RegisteredCollectionSlug = RegisteredCollectionSlug,
  L extends Locale = 'en',
> = ReducedToLocale<ResolvedRelations<RegisteredCollection[T]>, L>
