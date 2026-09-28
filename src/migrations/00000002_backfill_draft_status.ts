import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { CollectionSlug } from '@/types/collections'

/**
 * Collections that gained `SINGLE_VERSION_DRAFTS` while their read access
 * became status-aware. Documents created before drafts existed carry no
 * `_status` in the database, so `authenticatedOrPublished` (and any
 * access-enforced relationship population) skips them and they silently
 * vanish from public reads until someone re-saves them.
 */
const BACKFILLED_COLLECTIONS = [
  CollectionSlug.BlogTopics,
  CollectionSlug.ResumeSkillTags,
  CollectionSlug.ResumeCustomers,
  CollectionSlug.ResumeJobs,
] as const

export async function up({ payload, req: _req, session: _session }: MigrateUpArgs): Promise<void> {
  for (const collection of BACKFILLED_COLLECTIONS) {
    await payload.db.updateMany({
      collection,
      where: {
        _status: {
          exists: false,
        },
      },
      data: {
        _status: 'published',
      },
    })
  }
}

export async function down({
  payload: _payload,
  req: _req,
  session: _session,
}: MigrateDownArgs): Promise<void> {
  // Every document this migration touched was already publicly visible before
  // it ran, so there is nothing to roll back.
}
