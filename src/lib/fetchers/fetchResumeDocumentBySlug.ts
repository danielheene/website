import { cacheLife, cacheTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { CollectionData, CollectionSlug } from '@/types/collections'

export const fetchResumeDocumentBySlug = async (slug: string) => {
  'use cache'
  cacheLife('max')
  // Tagged with both the broad collection tag and one scoped to this slug:
  // documents here are create-only and immutable (update/delete are
  // `forbidden` on the collection), so an existing slug's data never
  // changes after creation and nothing currently revalidates the slug-scoped
  // tag on its own — the broad tag is what actually gets used today (see
  // fetchNewerDocumentVersions), kept here so a future create-triggered
  // revalidation of just this slug has something to target without also
  // reaching every other slug.
  cacheTag(CollectionSlug.ResumeDocuments, `${CollectionSlug.ResumeDocuments}:${slug}`)

  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.ResumeDocuments,
    draft: false,
    limit: 1,
    pagination: false,
    // overrideAccess: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return (docs[0] as CollectionData<CollectionSlug['ResumeDocuments']>) || null
}
