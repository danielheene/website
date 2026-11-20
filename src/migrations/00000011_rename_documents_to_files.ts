import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { renameRelationTo } from '@/lib/migrations/renameRelationTo'

type Args = MigrateUpArgs | MigrateDownArgs

/**
 * The `documents` upload collection became `files`, open to more file types.
 * Every stored slug moves with it: polymorphic relations (`relationTo`),
 * reference rows, list presets, admin preferences and the files' stored
 * URLs. Their S3 objects stay under the `documents/` key prefix.
 */
const renameCollection = async ({ payload, session }: Args, from: string, to: string) => {
  const db = payload.db.connection.db

  if (!db) throw new Error('No database connection')

  const names = new Set(
    (await db.listCollections({}, { nameOnly: true }).toArray()).map(({ name }) => name),
  )

  for (const name of names) {
    if (name === from) continue

    const collection = db.collection(name)

    for await (const doc of collection.find({}, { session })) {
      const renamed = renameRelationTo(doc, from, to)

      if (renamed) await collection.replaceOne({ _id: doc._id }, renamed, { session })
    }
  }

  const references = db.collection('document-references')

  for (const field of ['targetCollection', 'sourceCollection']) {
    await references.updateMany({ [field]: from }, { $set: { [field]: to } }, { session })
  }

  await db
    .collection('payload-query-presets')
    .updateMany({ relatedCollection: from }, { $set: { relatedCollection: to } }, { session })

  const preferences = db.collection('payload-preferences')

  for await (const preference of preferences.find({ key: `collection-${from}` }, { session })) {
    await preferences.updateOne(
      { _id: preference._id },
      { $set: { key: `collection-${to}` } },
      { session },
    )
  }

  const files = db.collection(from)

  for await (const file of files.find({ url: { $type: 'string' } }, { session })) {
    await files.updateOne(
      { _id: file._id },
      { $set: { url: String(file.url).replace(`/api/${from}/file/`, `/api/${to}/file/`) } },
      { session },
    )
  }

  if (!names.has(from)) return

  // Payload may have created the new collection empty while building its indexes on connect
  if (names.has(to) && (await db.collection(to).estimatedDocumentCount()) > 0) {
    throw new Error(`Cannot rename ${from} to ${to}: ${to} already holds documents`)
  }

  // last and outside the session: renameCollection cannot run inside a transaction
  await db.renameCollection(from, to, { dropTarget: true })

  payload.logger.info(`[migrate] renamed the ${from} collection to ${to}`)
}

export async function up(args: MigrateUpArgs): Promise<void> {
  await renameCollection(args, 'documents', 'files')
}

export async function down(args: MigrateDownArgs): Promise<void> {
  await renameCollection(args, 'files', 'documents')
}
