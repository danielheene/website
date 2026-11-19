import { cacheLife, cacheTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { CollectionSlug } from '@/types/collections'
import type { Topic } from '@/types/payload'

/** A published blog topic by slug, cached under the topics tag. */
export const fetchPublishedTopicBySlug = async (slug: string): Promise<Topic | null> => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.BlogTopics)

  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.BlogTopics,
    draft: false,
    limit: 1,
    pagination: false,
    overrideAccess: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return (docs[0] as Topic) ?? null
}
