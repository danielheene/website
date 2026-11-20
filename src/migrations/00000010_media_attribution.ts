import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import type { AttributionValue } from '@/lib/attribution'
import { attributionToCredits, creditsToAttribution } from '@/lib/migrations/creditsToAttribution'

// the stored names when this ran; 00000011 later renamed `documents` to `files`
const MEDIA_COLLECTIONS = ['images', 'videos', 'audios', 'documents'] as const

type StoredMedia = {
  _id: unknown
  credits?: unknown
  attribution?: AttributionValue | null
}

/**
 * The media collections' `credits` rich text became the `attribution` group.
 * Author and studio come from the credit's links; anything else stays as notes.
 *
 * Goes through the native driver: `credits` is no longer in the Mongoose
 * schema, so strict mode would neither return nor unset it.
 */
export async function up({ payload, session }: MigrateUpArgs): Promise<void> {
  for (const slug of MEDIA_COLLECTIONS) {
    const collection = payload.db.connection.collection(slug)

    const docs = await collection
      .find<StoredMedia>({ credits: { $exists: true } }, { session })
      .toArray()

    let migrated = 0

    for (const doc of docs) {
      const attribution = creditsToAttribution(doc.credits)

      await collection.updateOne(
        { _id: doc._id },
        {
          ...(attribution && { $set: { attribution } }),
          $unset: { credits: '' },
        },
        { session },
      )

      if (attribution) migrated += 1
    }

    payload.logger.info(`[migrate] ${slug}: moved ${migrated} credits to attribution`)
  }
}

export async function down({ payload, session }: MigrateDownArgs): Promise<void> {
  for (const slug of MEDIA_COLLECTIONS) {
    const collection = payload.db.connection.collection(slug)

    const docs = await collection
      .find<StoredMedia>({ attribution: { $exists: true } }, { session })
      .toArray()

    for (const doc of docs) {
      const credits = attributionToCredits(doc.attribution)

      await collection.updateOne(
        { _id: doc._id },
        {
          ...(credits && { $set: { credits } }),
          $unset: { attribution: '' },
        },
        { session },
      )
    }
  }
}
