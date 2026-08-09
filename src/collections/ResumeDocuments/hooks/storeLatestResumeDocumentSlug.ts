import { CollectionAfterChangeHook } from 'payload'

import { setLatestResumeDocumentCore } from '@/lib/fetchers/fetchLatestResumeDocumentCore'
import { CollectionData, CollectionSlug } from '@/types/collections'

export const storeLatestResumeDocumentSlug: CollectionAfterChangeHook<
  CollectionData<CollectionSlug['ResumeDocuments']>
> = async ({ operation, data }): Promise<void> => {
  if (operation === 'create') {
    const {
      id,
      title,
      createdAt,
      slug,
      document_en,
      checksum_en,
      thumbnails_en,
      document_de,
      checksum_de,
      thumbnails_de,
    } = data

    await setLatestResumeDocumentCore({
      id,
      title,
      createdAt,
      slug,
      document_en,
      checksum_en,
      thumbnails_en,
      document_de,
      checksum_de,
      thumbnails_de,
    })
  }
}
