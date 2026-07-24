'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { type Locale, reduceDataToLocale } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { type CollectionData, CollectionSlug } from '@/types/collections'

export const getJobsCollectionData = async (
  locale: Locale = 'en',
): Promise<CollectionData<CollectionSlug['ResumeJobs']>[]> => {
  const payload = await getPayload({
    config,
  })

  const { docs } = await payload.find({
    collection: CollectionSlug['ResumeJobs'],
    draft: false,
    pagination: false,
  })

  const enhancedDocs = await resolveRelations(docs)

  return reduceDataToLocale(enhancedDocs, locale)
}
