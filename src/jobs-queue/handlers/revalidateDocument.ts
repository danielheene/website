import type { CollectionSlug as PayloadCollectionSlug, TaskHandler } from 'payload'

import { toPagePath } from '@/collections/Pages/hooks/revalidatePage'
import { loadLatestDocument } from '@/jobs-queue/lib/documentTaskHandler'
import { FEATURED_TOPICS_TAG } from '@/lib/blog/featuredTopics'
import { LATEST_RESUME_DOCUMENT_TAG } from '@/lib/fetchers/fetchLatestResumeDocument'
import { generateContentPath } from '@/lib/generateContentPath'
import { revalidateCache } from '@/lib/revalidation/revalidateCache'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

const CONTENT_TAGS = [CollectionSlug.Pages, CollectionSlug.BlogPosts, CollectionSlug.BlogTopics]

type CacheEntries = {
  tags: string[]
  paths: string[]
}

/** The same tags and paths the collection's own revalidation hook clears. */
const cacheEntries = (collection: string, slug: string | null): CacheEntries => {
  switch (collection) {
    case CollectionSlug.Pages:
      return { tags: [CollectionSlug.Pages], paths: slug ? [toPagePath(slug)] : [] }
    case CollectionSlug.BlogPosts:
      return {
        tags: [CollectionSlug.BlogPosts],
        paths: slug ? [generateContentPath(CollectionSlug.BlogPosts, slug)] : [],
      }
    case CollectionSlug.BlogTopics:
      return {
        tags: [CollectionSlug.BlogTopics, CollectionSlug.BlogPosts, FEATURED_TOPICS_TAG],
        paths: slug ? [generateContentPath(CollectionSlug.BlogTopics, slug)] : [],
      }
    case CollectionSlug.ResumeDocuments:
      return { tags: [LATEST_RESUME_DOCUMENT_TAG], paths: [] }
    default:
      // media: documents embed their url, alt and credits
      return { tags: [collection, ...CONTENT_TAGS], paths: [] }
  }
}

const run: TaskHandler<TaskSlug['RevalidateDocument']> = async ({ input, req: { payload } }) => {
  // SAFETY: queued only for the collections listed in the task's definition
  const collection = input.collection as PayloadCollectionSlug
  const doc = await loadLatestDocument(payload, collection, input.id)
  const slug = doc && 'slug' in doc && doc.slug ? String(doc.slug) : null

  await revalidateCache(cacheEntries(input.collection, slug))

  return { output: { updated: true } }
}

export const handler = run
