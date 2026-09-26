import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { CollectionSlug } from '@/types/collections'

/**
 * ResumeSkills carried its own `published` checkbox alongside Payload's
 * draft/publish `_status`. The checkbox is gone — `_status` alone decides
 * visibility — so its stored values are dropped from the documents and their
 * versions.
 *
 * Documents where the two disagreed change visibility with this migration, so
 * they are logged for review before the values are removed.
 *
 * Updates go through the native driver collections: `published` is no longer
 * in the Mongoose schema, and strict mode silently strips updates to paths the
 * schema does not know.
 */
export async function up({ payload, session }: MigrateUpArgs): Promise<void> {
  const skills = payload.db.collections[CollectionSlug.ResumeSkills]
  const versions = payload.db.versions[CollectionSlug.ResumeSkills]

  const mismatched = await skills
    .find(
      {
        $or: [
          {
            published: true,
            _status: {
              $ne: 'published',
            },
          },
          {
            published: {
              $ne: true,
            },
            _status: 'published',
          },
        ],
      },
      {
        _id: 1,
        published: 1,
        _status: 1,
      },
      {
        session,
      },
    )
    .lean()

  for (const doc of mismatched) {
    payload.logger.warn(
      `[resume-skills] ${doc._id}: published=${doc.published ?? false} but _status=${doc._status ?? 'draft'} — now ${doc._status === 'published' ? 'shown' : 'hidden'}`,
    )
  }

  await skills.collection.updateMany(
    {},
    {
      $unset: {
        published: '',
      },
    },
    {
      session,
    },
  )

  await versions?.collection.updateMany(
    {},
    {
      $unset: {
        'version.published': '',
      },
    },
    {
      session,
    },
  )
}

/** Restores the checkbox from `_status`, the value `up` made authoritative. */
export async function down({ payload, session }: MigrateDownArgs): Promise<void> {
  const skills = payload.db.collections[CollectionSlug.ResumeSkills]

  await skills.collection.updateMany(
    {},
    [
      {
        $set: {
          published: {
            $eq: [
              '$_status',
              'published',
            ],
          },
        },
      },
    ],
    {
      session,
    },
  )
}
