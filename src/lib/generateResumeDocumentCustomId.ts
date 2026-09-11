import config from '@payload-config'
import { getPayload } from 'payload'

import { customAlphabet } from 'nanoid'

import { CollectionSlug } from '@/types/collections'

export const generateResumeDocumentUnsafeCustomId = () => {
  return customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ')(10)
}

export const generateResumeDocumentCustomId = async () => {
  'use server'

  const payload = await getPayload({
    config,
  })
  const unsafeId = generateResumeDocumentUnsafeCustomId()

  const { totalDocs } = await payload.count({
    collection: CollectionSlug.ResumeDocuments,
    where: {
      slug: {
        equals: unsafeId,
      },
    },
  })

  return totalDocs === 0 ? unsafeId : generateResumeDocumentCustomId()
}
