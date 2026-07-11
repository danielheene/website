'use server'

import { unstable_cache } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { type Locale, reduceDataToLocale } from '@/lib/i18n'
import { type CollectionData, CollectionSlug } from '@/types/collections'
import { resolveRelations } from '@/lib/resolveRelation'


export const getJobsCollectionData = async (
  locale: Locale = 'en',
): Promise<CollectionData<CollectionSlug['ResumeJobs']>[]> => {
  const payload = await getPayload({
    config,
  })

  const { docs } = await payload.find({
    collection: CollectionSlug['ResumeJobs'],
    pagination: false,
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  const enhancedDocs = await resolveRelations(docs)

  return reduceDataToLocale(enhancedDocs, locale)
}
