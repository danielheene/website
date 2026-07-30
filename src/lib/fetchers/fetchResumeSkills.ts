'use server'

import { revalidateTag, unstable_cache } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { Locale, reduceDataToLocale } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { CollectionSlug } from '@/types/collections'

export const fetchResumeSkills = async (locale: Locale = 'en') => {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.ResumeSkills,
    draft: false,
    pagination: false,
    limit: 0,
  })

  return await resolveRelations(reduceDataToLocale(docs, locale))
}

export const fetchResumeSkillsCached = unstable_cache(fetchResumeSkills, [], {
  tags: [
    CollectionSlug.ResumeSkills,
  ],
})

export const revalidateResumeSkills = async (): Promise<void> => {
  revalidateTag(CollectionSlug.ResumeSkills, 'max')
}
