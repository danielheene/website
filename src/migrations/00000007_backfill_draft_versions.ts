import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { CollectionSlug } from '@/types/collections'

/**
 * Collections with `versions.drafts`. The admin list and edit views read a
 * drafts collection through its versions (the `latest` one per document), so a
 * document without a version is invisible there even though the frontend,
 * which reads the main collection, still renders it.
 *
 * Documents written straight through the database adapter never get one: the
 * pages `00000001_initialize_basic_site` upserts, and anything created before
 * the collection gained drafts. This gives each of them the version Payload
 * would have saved, built from the document as it is stored.
 */
const DRAFTS_COLLECTIONS = [
  CollectionSlug.Pages,
  CollectionSlug.BlogPosts,
  CollectionSlug.BlogTopics,
  CollectionSlug.ResumeJobs,
  CollectionSlug.ResumeProjects,
  CollectionSlug.ResumeSkills,
  CollectionSlug.ResumeSkillTags,
  CollectionSlug.ResumeCustomers,
] as const

type StoredDoc = {
  id: number | string
  createdAt?: string
  updatedAt?: string
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const collection of DRAFTS_COLLECTIONS) {
    const versioned = await payload.db.versions[collection].distinct('parent', {
      latest: true,
    })
    const versionedIds = new Set(versioned.map(String))

    const { docs } = await payload.db.find<StoredDoc>({
      collection,
      limit: 0,
      pagination: false,
      req,
    })
    const missing = docs.filter((doc) => !versionedIds.has(String(doc.id)))

    for (const doc of missing) {
      await payload.db.createVersion({
        autosave: false,
        collectionSlug: collection,
        createdAt: doc.createdAt ?? doc.updatedAt ?? new Date().toISOString(),
        parent: doc.id,
        req,
        updatedAt: doc.updatedAt ?? new Date().toISOString(),
        versionData: doc,
      })
    }

    if (missing.length > 0) {
      payload.logger.info(`[migrate] ${collection}: created ${missing.length} missing version(s)`)
    }
  }
}

export async function down({
  payload: _payload,
  req: _req,
  session: _session,
}: MigrateDownArgs): Promise<void> {
  // The versions this migration adds are indistinguishable from ones Payload
  // saves, and removing them would hide the documents from the admin again.
}
