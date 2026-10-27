import { cacheLife, cacheTag, revalidateTag } from 'next/cache'

import { BilingualLanguage, reduceDataToBilingualLanguage } from '@website/lib/i18n'
import { CollectionSlug } from '@website/types/collections'
import type { ResumeProjectData } from '@website/types/payload'

import { fetchCollection } from '@/lib/payloadClient'
import { resolveRelations } from '@/lib/resolveRelation'

export const fetchResumeProjects = async (locale: BilingualLanguage = 'en') => {
  const docs = await fetchCollection<ResumeProjectData>(CollectionSlug.ResumeProjects, {
    cacheTag: CollectionSlug.ResumeProjects,
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

export const fetchResumeProjectsCached = async (locale: BilingualLanguage = 'en') => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.ResumeProjects)

  return await fetchResumeProjects(locale)
}

export const revalidateResumeProjects = async (): Promise<void> => {
  revalidateTag(CollectionSlug.ResumeProjects, 'max')
}
