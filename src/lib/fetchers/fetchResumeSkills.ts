import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { BilingualLanguage, reduceDataToBilingualLanguage } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { CollectionSlug } from '@/types/collections'

export const fetchResumeSkills = async (locale: BilingualLanguage = 'en') => {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.ResumeSkills,
    draft: false,
    pagination: false,
    limit: 0,
  })

  return await resolveRelations(reduceDataToBilingualLanguage(docs, locale))
}

export const fetchResumeSkillsCached = async (locale: BilingualLanguage = 'en') => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.ResumeSkills)
  return await fetchResumeSkills(locale)
}

export const revalidateResumeSkills = async (): Promise<void> => {
  revalidateTag(CollectionSlug.ResumeSkills, 'max')
}
