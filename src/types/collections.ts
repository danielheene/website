import type {
  CollectionSlug as RegisteredCollectionSlug,
  TypedCollection,
} from 'payload'

import type { ReducedToLocale } from '@/lib/i18n'

/**
 *
 * COLLECTIONS
 *
 */
export enum CollectionSlug {
  BlogPosts = 'blog-posts',
  BlogTags = 'blog-tags',
  MediaImages = 'images',
  MediaVideos = 'videos',
  MediaDocuments = 'documents',
  MediaAudios = 'audios',
  Pages = 'pages',
  ResumeSkills = 'resume-skills',
  ResumeJobs = 'resume-jobs',
  Users = 'users',
}

export const COLLECTION_PREFIX_MAP: Partial<Record<CollectionSlug, string>> = {
  [CollectionSlug.Pages]: '',
  [CollectionSlug.BlogPosts]: 'posts',
  [CollectionSlug.BlogTags]: 'tags',
} as const

export type { CollectionSlug as RegisteredCollectionSlug } from 'payload'
export type CollectionData<
  T extends RegisteredCollectionSlug = RegisteredCollectionSlug,
> = ReducedToLocale<TypedCollection[T]>
