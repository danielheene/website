/**
 *    Seeds the fixed query presets that hide task-generated files.
 *
 *    Usage:
 *      pnpm seed:presets          # create the presets
 *      pnpm seed:presets:clean    # remove them
 *
 *    The resume workflow writes generated PDFs and their thumbnails into the
 *    media collections tagged `+auto-generated`, which otherwise bury
 *    hand-uploaded assets in the list views. These presets filter them out.
 *
 *    Presets are configuration, not user data: `payload.config.ts` denies
 *    create/update/delete on `payload-query-presets`, so this script is the
 *    only writer. It runs through the Local API, which bypasses access control
 *    by default.
 *
 *    Idempotent: presets are matched by title and skipped when they exist.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { CollectionSlug } from '@/types/collections'

/**
 * Every media collection that carries `GeneratorFlagsField`, and so can hold
 * task-generated files.
 */
const MEDIA_COLLECTIONS = [
  CollectionSlug.MediaImages,
  CollectionSlug.MediaDocuments,
  CollectionSlug.MediaVideos,
  CollectionSlug.MediaAudios,
] as const

const TITLE_PREFIX = 'Hide generated'

/**
 * Presets are stored per collection — `relatedCollection` is a single slug, so
 * hiding generated files everywhere means one preset per media collection.
 */
const buildPresets = () =>
  MEDIA_COLLECTIONS.map((relatedCollection) => ({
    title: `${TITLE_PREFIX} — ${relatedCollection}`,
    relatedCollection,
    isShared: true,
    where: {
      generatorFlags: {
        not_in: [
          '+auto-generated',
        ],
      },
    },
    access: {
      read: {
        constraint: 'everyone' as const,
      },
      update: {
        constraint: 'onlyMe' as const,
      },
      delete: {
        constraint: 'onlyMe' as const,
      },
    },
  }))

const run = async () => {
  const payload = await getPayload({
    config,
  })

  const clean = process.argv.includes('--clean')
  const presets = buildPresets()

  if (clean) {
    const { docs } = await payload.find({
      collection: CollectionSlug.PayloadQueryPresets,
      pagination: false,
      limit: 0,
      where: {
        title: {
          like: TITLE_PREFIX,
        },
      },
    })

    for (const doc of docs) {
      await payload.delete({
        collection: CollectionSlug.PayloadQueryPresets,
        id: doc.id,
      })
      console.info(`removed preset: ${doc.title}`)
    }

    console.info(`\nClean complete: ${docs.length} preset(s) removed.`)
    process.exit(0)
  }

  let created = 0

  for (const preset of presets) {
    const { docs } = await payload.find({
      collection: CollectionSlug.PayloadQueryPresets,
      limit: 1,
      pagination: false,
      where: {
        title: {
          equals: preset.title,
        },
      },
    })

    if (docs.length > 0) {
      console.info(`exists, skipped: ${preset.title}`)
      continue
    }

    await payload.create({
      collection: CollectionSlug.PayloadQueryPresets,
      data: preset,
    })
    created++
    console.info(`created preset: ${preset.title}`)
  }

  console.info(`\nSeed complete: ${created} new preset(s).`)
  process.exit(0)
}

await run()
