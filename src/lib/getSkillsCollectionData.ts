'use server'

import { unstable_cache } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { type Locale, reduceDataToLocale } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { type CollectionData, CollectionSlug } from '@/types/collections'

export const getSkillsCollectionData = async (
  locale: Locale = 'en',
): Promise<CollectionData<CollectionSlug['ResumeSkills']>[]> => {
  const payload = await getPayload({
    config,
  })

  const { docs } = await payload.find({
    collection: CollectionSlug['ResumeSkills'],
    pagination: false,
  })

  return await resolveRelations(reduceDataToLocale(docs, locale))
}

export const getCachedSkillsCollectionData = unstable_cache(getSkillsCollectionData, [], {
  tags: [
    CollectionSlug['ResumeSkills'],
  ],
})
