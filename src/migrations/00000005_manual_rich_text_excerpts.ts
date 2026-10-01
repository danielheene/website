import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { CollectionSlug } from '@/types/collections'

/** Node type of the removed Read More marker. */
const READ_MORE_NODE_TYPE = 'readMore'

const paragraphState = (text: string) => ({
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: [
      {
        type: 'paragraph',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        children: [
          {
            type: 'text',
            version: 1,
            text,
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
          },
        ],
      },
    ],
  },
})

/**
 * Blog post excerpts are written by hand now, in a rich-text field, instead of
 * being computed from the content into plain text.
 *
 * - Every post and version with a plain-text excerpt gets it wrapped in a
 *   single paragraph, so the computed excerpts stay as a starting point to
 *   edit. Blank ones are removed.
 * - The Read More marker that set where the computed excerpt ended is gone
 *   from the editor, so its nodes are pulled from the post content; the
 *   editor fails on node types it has no feature for.
 *
 * Updates go through the native driver collections so no hooks or
 * validation run, and in particular no excerpt generation is queued.
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

    const plain = await model.collection
      .find(
        {
          [`${prefix}excerpt`]: {
            $type: 'string',
          },
        },
        {
          projection: {
            [`${prefix}excerpt`]: 1,
          },
          session,
        },
      )
      .toArray()

    for (const doc of plain) {
      const text = String((prefix ? doc.version?.excerpt : doc.excerpt) ?? '').trim()

      await model.collection.updateOne(
        {
          _id: doc._id,
        },
        text
          ? {
              $set: {
                [`${prefix}excerpt`]: paragraphState(text),
              },
            }
          : {
              $unset: {
                [`${prefix}excerpt`]: '',
              },
            },
        {
          session,
        },
      )
    }

    const { modifiedCount } = await model.collection.updateMany(
      {
        [`${prefix}content.root.children.type`]: READ_MORE_NODE_TYPE,
      },
      // The driver's `$pull` typing cannot follow a computed key into the
      // nested array, so the update document is typed as the call expects.
      {
        $pull: {
          [`${prefix}content.root.children`]: {
            type: READ_MORE_NODE_TYPE,
          },
        },
      } as Parameters<typeof model.collection.updateMany>[1],
      {
        session,
      },
    )

    payload.logger.info(
      `[posts] converted ${plain.length} plain-text excerpt(s) and removed Read More markers from ${modifiedCount} document(s) in ${model.collection.collectionName}`,
    )
  }
}

/**
 * Nothing to restore: the markers only marked where a computed excerpt ended,
 * and the converted excerpts hold the same text as before.
 */
export async function down(_args: MigrateDownArgs): Promise<void> {}
