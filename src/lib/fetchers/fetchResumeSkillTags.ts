import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { BilingualLanguage, reduceDataToBilingualLanguage } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { CollectionSlug } from '@/types/collections'

export const fetchResumeSkillTags = async (locale: BilingualLanguage = 'en') => {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.ResumeSkillTags,
    draft: false,
    pagination: false,
    limit: 0,
  })

  return await resolveRelations(reduceDataToBilingualLanguage(docs, locale))
}

export const fetchResumeSkillTagsCached = async (locale: BilingualLanguage = 'en') => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.ResumeSkillTags)
  return await fetchResumeSkillTags(locale)
}

export const revalidateResumeSkillTags = async (): Promise<void> => {
  revalidateTag(CollectionSlug.ResumeSkillTags, 'max')
}
