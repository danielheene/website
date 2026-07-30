'use server'

import { revalidateTag, unstable_cache } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { Locale, reduceDataToLocale } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { CollectionSlug } from '@/types/collections'

export const fetchResumeJobs = async (locale: Locale = 'en') => {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.ResumeJobs,
    draft: false,
    pagination: false,
    limit: 0,
  })

  return await resolveRelations(reduceDataToLocale(docs, locale))
}

export const fetchResumeJobsCached = unstable_cache(fetchResumeJobs, [], {
  tags: [
    CollectionSlug.ResumeJobs,
  ],
})

export const revalidateResumeJobs = async (): Promise<void> => {
  revalidateTag(CollectionSlug.ResumeJobs, 'max')
}
