'use server'

import { unstable_cache } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { CollectionSlug } from '@/types/collections'

export const fetchResumeProjects = async () => {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.ResumeProjects,
    draft: false,
    pagination: false,
    limit: 0,
  })

  return docs
}

export const fetchResumeProjectsCached = unstable_cache(fetchResumeProjects, [], {
  tags: [
    CollectionSlug.ResumeProjects,
  ],
})
