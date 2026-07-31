import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { Locale, reduceDataToLocale } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { CollectionSlug } from '@/types/collections'

export const fetchResumeCustomers = async (locale: Locale = 'en') => {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.ResumeCustomers,
    draft: false,
    pagination: false,
    limit: 0,
  })

  return await resolveRelations(reduceDataToLocale(docs, locale))
}

export const fetchResumeCustomersCached = async (locale: Locale = 'en') => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.ResumeCustomers)
  return fetchResumeCustomers(locale)
}

export const revalidateResumeCustomers = async (): Promise<void> => {
  revalidateTag(CollectionSlug.ResumeCustomers, 'max')
}
