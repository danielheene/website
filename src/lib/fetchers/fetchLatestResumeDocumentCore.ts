import config from '@payload-config'
import { getPayload } from 'payload'

import { resolveRelations } from '@/lib/resolveRelation'
import { CollectionData, CollectionSlug } from '@/types/collections'

type LatestResumeDocumentCore = Pick<
  CollectionData<CollectionSlug['ResumeDocuments']>,
  | 'id'
  | 'title'
  | 'createdAt'
  | 'slug'
  | 'document_en'
  | 'checksum_en'
  | 'thumbnails_en'
  | 'document_de'
  | 'checksum_de'
  | 'thumbnails_de'
>

const cacheKey = `${CollectionSlug.ResumeDocuments}:latest`

export const fetchLatestResumeDocumentCore = async (): Promise<LatestResumeDocumentCore> => {
  const payload = await getPayload({
    config,
  })

  let data: string = await payload.kv.get(cacheKey)
  if (!data) {
    const {
      docs: [latest],
    } = await payload.find({
      collection: CollectionSlug.ResumeDocuments,
      limit: 1,
      pagination: false,
      sort: '-createdAt',
      depth: 0,
      select: {
        id: true,
        title: true,
        createdAt: true,
        slug: true,
        document_en: true,
        checksum_en: true,
        thumbnails_en: true,
        document_de: true,
        checksum_de: true,
        thumbnails_de: true,
      },
    })

    if (latest) {
      data = JSON.stringify(await resolveRelations(latest))
      await payload.kv.set(cacheKey, data)
    }
  }

  return JSON.parse(data)
}

export const setLatestResumeDocumentCore = async (
  document: LatestResumeDocumentCore,
): Promise<void> => {
  const payload = await getPayload({
    config,
  })

  const data = JSON.stringify(await resolveRelations(document))
  await payload.kv.set(cacheKey, data)
}
