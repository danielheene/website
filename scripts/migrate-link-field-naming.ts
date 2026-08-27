/**
 *    Migrates stored links to `LinkField`'s renamed shape (see
 *    `src/fields/Link/index.ts`), which now matches lexical's own
 *    `LinkFeature` base-field naming instead of a bespoke one:
 *
 *      linkType: 'reference'  ->  'internal'
 *      linkType: 'url'        ->  'custom'
 *      reference               ->  doc
 *
 *    Usage:
 *      pnpm links:migrate
 *
 *    Run this once, immediately after deploying the `LinkField` rename — the
 *    schema change and this script are one unit of work, not independently
 *    orderable.
 *
 *    Reads and writes the raw MongoDB collections directly
 *    (`payload.db.connection`), bypassing Payload's field-aware local API:
 *    links are buried in block arrays and lexical node JSON, so a
 *    field-aware read would drop the very keys this migration needs to see.
 *    It also means no `afterChange` hooks fire — in particular no
 *    revalidation. Trigger one manually after this finishes.
 *
 *    Safe to re-run: documents with nothing left to rewrite are skipped.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { migrateLinkFieldNaming } from '@/lib/migrations/migrateLinkFieldNaming'
import { CollectionSlug } from '@/types/collections'

const payload = await getPayload({
  config,
})

/**
 * Every store that can contain a link, including the globals collection.
 *
 * "Can contain a link" means a `RichTextField` whose `editorVariant` builds
 * on `captionFeatures` or `markdownFeatures` in `src/fields/RichText/index.ts`
 * — those are the only variants `LinkFeature` is spread into — plus any
 * `LinkField`/`LinkGroupField` group or array field outside RichText (Footer
 * nav, `LinkGroupBlock` entries, and similar, which live on `SiteSettings`
 * under `globals`). The `inline` variant (`ResumeJobs`, `ResumeSkills`) stops
 * one layer short of `LinkFeature` and cannot hold a link node, so those
 * collections are correctly absent here.
 */
const TARGET_COLLECTIONS = [
  CollectionSlug.Pages,
  CollectionSlug.BlogPosts,
  CollectionSlug.BlogTopics,
  CollectionSlug.ResumeProjects,
  CollectionSlug.MediaImages,
  CollectionSlug.MediaVideos,
  CollectionSlug.MediaDocuments,
  CollectionSlug.MediaAudios,
  'globals',
]

let migratedDocs = 0
let migratedLinks = 0
let skipped = 0

for (const collectionName of TARGET_COLLECTIONS) {
  const collection = payload.db.connection.collection(collectionName)
  const docs = await collection.find({}).toArray()

  for (const doc of docs) {
    const { _id, ...rest } = doc
    const { value, changed } = migrateLinkFieldNaming(rest)

    if (changed === 0) {
      skipped += 1
      continue
    }

    await collection.replaceOne(
      {
        _id,
      },
      {
        _id,
        ...(value as Record<string, unknown>),
      },
    )

    migratedDocs += 1
    migratedLinks += changed
  }
}

console.info(
  `Migrated ${migratedLinks} link(s) across ${migratedDocs} document(s), skipped ${skipped} (nothing to rewrite).`,
)
process.exit(0)
