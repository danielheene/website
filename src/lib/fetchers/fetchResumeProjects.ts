import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { Locale, reduceDataToLocale } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { CollectionSlug } from '@/types/collections'

export const fetchResumeProjects = async (locale: Locale = 'en') => {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.ResumeProjects,
    draft: false,
    pagination: false,
    limit: 0,
  })

  return await resolveRelations(reduceDataToLocale(docs, locale))
}

export const fetchResumeProjectsCached = async (locale: Locale = 'en') => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.ResumeProjects)
  return await fetchResumeProjects(locale)
}

export const revalidateResumeProjects = async (): Promise<void> => {
  revalidateTag(CollectionSlug.ResumeProjects, 'max')
}
