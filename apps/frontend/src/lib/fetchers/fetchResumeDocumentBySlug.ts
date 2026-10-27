import { cacheLife, cacheTag } from 'next/cache'

import { CollectionSlug } from '@website/types/collections'
import type { ResumeDocumentData } from '@website/types/payload'

import { fetchCollection } from '@/lib/payloadClient'

export const fetchResumeDocumentBySlug = async (slug: string) => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.ResumeDocuments)
  cacheTag(`${CollectionSlug.ResumeDocuments}:${slug}`)

  const docs = await fetchCollection<ResumeDocumentData>(CollectionSlug.ResumeDocuments, {
    cacheTag: CollectionSlug.ResumeDocuments,
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    pagination: false,
  })

  return docs[0] || null
}
