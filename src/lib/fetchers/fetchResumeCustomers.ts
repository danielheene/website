import { cacheLife, cacheTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { BilingualLanguage, reduceDataToBilingualLanguage } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { revalidateCache } from '@/lib/revalidation/revalidateCache'
import { CollectionSlug } from '@/types/collections'

export const fetchResumeCustomers = async (locale: BilingualLanguage = 'en') => {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.ResumeCustomers,
    draft: false,
    pagination: false,
    limit: 0,
    // the logo itself is served by the logo endpoint
    select: {
      title: true,
      slug: true,
      updatedAt: true,
    },
    // runs with overrideAccess, so never-published drafts must be excluded here
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return resolveRelations(reduceDataToBilingualLanguage(docs, locale))
}

export const fetchResumeCustomersCached = async (locale: BilingualLanguage = 'en') => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.ResumeCustomers)

  return await fetchResumeCustomers(locale)
}

export const revalidateResumeCustomers = async (): Promise<void> => {
  await revalidateCache({
    tags: [CollectionSlug.ResumeCustomers],
  })
}
