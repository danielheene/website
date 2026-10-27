import { cacheLife, cacheTag, revalidateTag } from 'next/cache'

import { BilingualLanguage, reduceDataToBilingualLanguage } from '@website/lib/i18n'
import { CollectionSlug } from '@website/types/collections'
import type { ResumeSkillTagData } from '@website/types/payload'

import { fetchCollection } from '@/lib/payloadClient'
import { resolveRelations } from '@/lib/resolveRelation'

export const fetchResumeSkillTags = async (locale: BilingualLanguage = 'en') => {
  const docs = await fetchCollection<ResumeSkillTagData>(CollectionSlug.ResumeSkillTags, {
    cacheTag: CollectionSlug.ResumeSkillTags,
    where: {
      _status: {
        equals: 'published',
      },
    },
    limit: 0,
    pagination: false,
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
