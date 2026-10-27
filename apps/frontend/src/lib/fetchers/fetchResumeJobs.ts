import { cacheLife, cacheTag, revalidateTag } from 'next/cache'

import { BilingualLanguage, reduceDataToBilingualLanguage } from '@website/lib/i18n'
import { CollectionSlug } from '@website/types/collections'
import type { ResumeJobData } from '@website/types/payload'

import { fetchCollection } from '@/lib/payloadClient'
import { resolveRelations } from '@/lib/resolveRelation'

export const fetchResumeJobs = async (locale: BilingualLanguage = 'en') => {
  const docs = await fetchCollection<ResumeJobData>(CollectionSlug.ResumeJobs, {
    cacheTag: CollectionSlug.ResumeJobs,
    where: {
      _status: {
        equals: 'published',
      },
    },
    sort: '-startDate',
    limit: 0,
    pagination: false,
  })

  return await resolveRelations(reduceDataToBilingualLanguage(docs, locale))
}

export const fetchResumeJobsCached = async (locale: BilingualLanguage = 'en') => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.ResumeJobs)

  return await fetchResumeJobs(locale)
}

export const revalidateResumeJobs = async (): Promise<void> => {
  revalidateTag(CollectionSlug.ResumeJobs, 'max')
}
