import { cacheLife, cacheTag, revalidateTag } from 'next/cache'

import { BilingualLanguage, reduceDataToBilingualLanguage } from '@website/lib/i18n'
import { CollectionSlug } from '@website/types/collections'
import type { ResumeSkillData } from '@website/types/payload'

import { fetchCollection } from '@/lib/payloadClient'
import { resolveRelations } from '@/lib/resolveRelation'

export const fetchResumeSkills = async (locale: BilingualLanguage = 'en') => {
  const docs = await fetchCollection<ResumeSkillData>(CollectionSlug.ResumeSkills, {
    cacheTag: CollectionSlug.ResumeSkills,
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

export const fetchResumeSkillsCached = async (locale: BilingualLanguage = 'en') => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.ResumeSkills)

  return await fetchResumeSkills(locale)
}

export const revalidateResumeSkills = async (): Promise<void> => {
  revalidateTag(CollectionSlug.ResumeSkills, 'max')
}
