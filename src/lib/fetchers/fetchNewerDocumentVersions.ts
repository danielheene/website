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

  const { totalDocs } = await payload.count({
    collection: CollectionSlug.ResumeDocuments,
    where: {
      createdAt: {
        greater_than: createdAt,
      },
    },
  })

  return totalDocs
}
