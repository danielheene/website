import { CollectionAfterChangeHook } from 'payload'

import { LATEST_RESUME_DOCUMENT_TAG } from '@/lib/fetchers/fetchLatestResumeDocument'
import { revalidateCache } from '@/lib/revalidation/revalidateCache'
import { CollectionData, CollectionSlug } from '@/types/collections'

/**
 * Expires the cached "latest" resume document whenever a new one is created.
 * Creation usually happens in the `createResumeDocument` job on the
 * standalone worker, where `revalidateCache` goes through `/api/revalidate`.
 */
export const revalidateLatestResumeDocument: CollectionAfterChangeHook<
  CollectionData<CollectionSlug['ResumeDocuments']>
> = async ({ operation }): Promise<void> => {
  if (operation !== 'create') return

  await revalidateCache({
    tags: [LATEST_RESUME_DOCUMENT_TAG],
    profile: 'immediate',
  })
}
