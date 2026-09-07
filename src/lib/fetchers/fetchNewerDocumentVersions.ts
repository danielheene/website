import { cacheLife } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { CollectionSlug } from '@/types/collections'
import { ResumeDocumentData } from '@/types/payload'

export const fetchNewerDocumentVersions = async (createdAt: ResumeDocumentData['createdAt']) => {
  'use cache'
  cacheLife('seconds')

  if (!createdAt) return 0

  const payload = await getPayload({
    config,
  })

  const { docs } = await payload.find({
    collection: CollectionSlug.ResumeDocuments,
    pagination: false,
    // limit: 0,
    where: {
      createdAt: {
        greater_than_equal: createdAt,
      },
    },
  })

  return Array.isArray(docs) ? docs.length - 1 : 0
}
