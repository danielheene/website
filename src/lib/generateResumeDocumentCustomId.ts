import config from '@payload-config'
import { getPayload } from 'payload'

import { generateResumeDocumentUnsafeCustomId } from '@/lib/generateResumeDocumentUnsafeCustomId'
import { CollectionSlug } from '@/types/collections'

export { generateResumeDocumentUnsafeCustomId } from '@/lib/generateResumeDocumentUnsafeCustomId'

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
