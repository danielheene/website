import { cacheLife, cacheTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { CollectionData, CollectionSlug } from '@/types/collections'

export type LatestResumeDocument = Pick<
  CollectionData<CollectionSlug['ResumeDocuments']>,
  | 'id'
  | 'title'
  | 'createdAt'
  | 'slug'
  | 'document_en'
  | 'checksum_en'
  | 'thumbnails_en'
  | 'document_de'
  | 'checksum_de'
  | 'thumbnails_de'
>

/**
 * Scoped narrower than the broad `CollectionSlug.ResumeDocuments` tag every
 * other resume-document fetcher uses, so revalidating "latest" specifically
 * (see `revalidateLatestResumeDocument`) doesn't also blow away unrelated
 * per-slug reads (`fetchResumeDocumentBySlug`) or the newer-versions count
 * (`fetchNewerDocumentVersions`).
 */
export const LATEST_RESUME_DOCUMENT_TAG = `${CollectionSlug.ResumeDocuments}:latest`

/**
 * Reads the newest `ResumeDocuments` doc directly — no KV indirection.
 * Nothing outside Next (the `worker` job queue that creates these documents
 * never reads "latest" back, only writes new ones) consumes this value, so
 * there was no cross-process reason to cache it anywhere but here.
 */
export const fetchLatestResumeDocument = async (): Promise<LatestResumeDocument | null> => {
  'use cache'
  cacheLife('max')
  cacheTag(LATEST_RESUME_DOCUMENT_TAG)

  const payload = await getPayload({
    config,
  })

  const {
    docs: [latest],
  } = await payload.find({
    collection: CollectionSlug.ResumeDocuments,
    limit: 1,
    pagination: false,
    sort: '-createdAt',
    select: {
      id: true,
      title: true,
      createdAt: true,
      slug: true,
      document_en: true,
      checksum_en: true,
      thumbnails_en: true,
      document_de: true,
      checksum_de: true,
      thumbnails_de: true,
    },
  })

  return (latest as LatestResumeDocument) ?? null
}
