import { cacheLife } from 'next/cache'

import { CollectionSlug } from '@website/types/collections'
import { ResumeDocumentData } from '@website/types/payload'

import { countCollection } from '@/lib/payloadClient'

export const fetchNewerDocumentVersions = async (
  createdAt: ResumeDocumentData['createdAt'],
): Promise<number> => {
  'use cache'
  cacheLife('seconds')

  if (!createdAt) return 0

  return countCollection(CollectionSlug.ResumeDocuments, {
    createdAt: {
      greater_than: createdAt,
    },
  })
}
