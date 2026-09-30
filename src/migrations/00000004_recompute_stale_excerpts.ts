import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { computeExcerpt } from '@/collections/BlogPosts/hooks/generateExcerpt'
import { CollectionSlug } from '@/types/collections'

/**
 * The blog post excerpt used to be a rich-text field. It is plain text now,
 * computed from the content on save, but Payload leaves stored values alone,
 * so posts not saved since still carry a Lexical `{ root }` object that the
 * listing renders as a React child and crashes on.
 *
 * Every post and version with an object excerpt gets it recomputed from its
 * content, or removed when there is no content to derive it from. Updates go
 * through the native driver collections so no hooks or validation run.
 */
export async function up({ payload, session }: MigrateUpArgs): Promise<void> {
  const targets = [
    {
      model: payload.db.collections[CollectionSlug.BlogPosts],
      prefix: '',
    },
    {
      model: payload.db.versions[CollectionSlug.BlogPosts],
      prefix: 'version.',
    },
  ]

  for (const { model, prefix } of targets) {
    if (!model) continue

    const stale = await model.collection
      .find(
        {
          [`${prefix}excerpt`]: {
            $type: 'object',
          },
        },
        {
          projection: {
            [`${prefix}content`]: 1,
          },
          session,
        },
      )
      .toArray()

    for (const doc of stale) {
      const content = prefix ? doc.version?.content : doc.content
      const excerpt = computeExcerpt(content)

      await model.collection.updateOne(
        {
          _id: doc._id,
        },
        excerpt === undefined
          ? {
              $unset: {
                [`${prefix}excerpt`]: '',
              },
            }
          : {
              $set: {
                [`${prefix}excerpt`]: excerpt,
              },
            },
        {
          session,
        },
      )
    }

    payload.logger.info(
      `[posts] recomputed ${stale.length} stale excerpt(s) in ${model.collection.collectionName}`,
    )
  }
}

/**
 * Nothing to restore: the rich-text excerpts belonged to a field that no
 * longer exists, and the recomputed text is what a re-save would produce.
 */
export async function down(_args: MigrateDownArgs): Promise<void> {}
