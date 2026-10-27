import { cacheLife, cacheTag } from 'next/cache'

import { CollectionSlug } from '@website/types/collections'
import type { MediaDocument, MediaImage } from '@website/types/payload'

import { fetchCollection } from '@/lib/payloadClient'

export type LatestResumeDocument = {
  id: string
  title: string
  createdAt: string
  slug: string
  document_en: { relationTo: 'documents'; value: MediaDocument } | null
  checksum_en: string
  thumbnails_en: { relationTo: 'images'; value: MediaImage }[] | null
  document_de: { relationTo: 'documents'; value: MediaDocument } | null
  checksum_de: string
  thumbnails_de: { relationTo: 'images'; value: MediaImage }[] | null
}

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

  const docs = await fetchCollection<LatestResumeDocument>(CollectionSlug.ResumeDocuments, {
    cacheTag: LATEST_RESUME_DOCUMENT_TAG,
    depth: 1,
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

  return docs[0] ?? null
}
