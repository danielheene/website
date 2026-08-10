/**
 *    Seeds the fixed query presets that hide task-generated files.
 *
 *    Usage:
 *      pnpm seed:presets          # create the presets
 *      pnpm seed:presets:clean    # remove them
 *
 *    The resume workflow writes generated PDFs and their thumbnails into the
 *    media collections, where they otherwise bury hand-uploaded assets in the
 *    list views. Generated files carry `generatorFlags`; hand-uploaded ones do
 *    not, so these presets filter on the absence of that field.
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

import { GENERATOR_FLAGS } from '@/fields/GeneratorFlags'
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
    /**
     * Generated assets always carry at least one flag; hand-uploaded ones carry
     * none, so excluding every known flag hides exactly the task-created files.
     *
     * `exists: false` does not work here: the field is stored as an empty array
     * on hand-uploaded documents, which counts as present.
     */
    where: {
      generatorFlags: {
        not_in: [
          ...GENERATOR_FLAGS,
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

/**
 * Selects each preset for every existing user.
 *
 * Payload has no `defaultPreset` in collection config — the active preset is
 * per-user state stored in `payload-preferences` under `collection-<slug>`. So
 * "default" here means pre-selecting it for the users that exist right now;
 * users created later start with no preset until this is re-run.
 *
 * Existing preference values are merged rather than replaced, so column
 * choices, sort order and page size survive.
 */
const applyAsDefaultForUsers = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  presetIdByCollection: Map<string, string>,
): Promise<number> => {
  const { docs: users } = await payload.find({
    collection: CollectionSlug.Users,
    limit: 0,
    pagination: false,
  })

  let applied = 0

  for (const user of users) {
    for (const [relatedCollection, presetId] of presetIdByCollection) {
      const key = `collection-${relatedCollection}`

      const { docs } = await payload.find({
        collection: CollectionSlug.PayloadPreferences,
        limit: 1,
        pagination: false,
        // keep `user.value` an id — populated documents cannot be written back
        depth: 0,
        where: {
          and: [
            {
              key: {
                equals: key,
              },
            },
            {
              'user.value': {
                equals: user.id,
              },
            },
          ],
        },
      })

      const value = (docs[0]?.value ?? {}) as Record<string, unknown>

      // Don't clobber a preset the user picked themselves.
      if (value.preset) continue

      /**
       * Written through `db.upsert`, the same path Payload's own preferences
       * API uses. `payload.update()` does not work here: the collection marks
       * `user` required and revalidates it on write, and the admin API normally
       * supplies it from the request context rather than the payload.
       */
      await payload.db.upsert({
        collection: CollectionSlug.PayloadPreferences,
        data: {
          key,
          user: {
            relationTo: CollectionSlug.Users,
            value: user.id,
          },
          value: {
            ...value,
            preset: presetId,
          },
        },
        where: {
          and: [
            {
              key: {
                equals: key,
              },
            },
            {
              'user.value': {
                equals: user.id,
              },
            },
          ],
        },
      })

      applied++
    }
  }

  return applied
}

/**
 * Removes the preset selection from any preference pointing at one of the given
 * presets, leaving the rest of that preference untouched.
 */
const clearSelectionForUsers = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  presetIds: string[],
): Promise<number> => {
  if (presetIds.length === 0) return 0

  const { docs } = await payload.find({
    collection: CollectionSlug.PayloadPreferences,
    limit: 0,
    pagination: false,
    // keep `user.value` an id — populated documents cannot be written back
    depth: 0,
    where: {
      key: {
        like: 'collection-',
      },
    },
  })

  let cleared = 0

  for (const doc of docs) {
    const value = (doc.value ?? {}) as Record<string, unknown>
    if (!value.preset || !presetIds.includes(String(value.preset))) continue

    const { preset: _removed, ...rest } = value

    // `db.upsert` for the same reason as in `applyAsDefaultForUsers`.
    await payload.db.upsert({
      collection: CollectionSlug.PayloadPreferences,
      data: {
        key: doc.key,
        user: doc.user,
        value: rest,
      },
      where: {
        id: {
          equals: doc.id,
        },
      },
    })
    cleared++
  }

  return cleared
}

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

    // Clear the selection first, so no preference is left pointing at a
    // preset that no longer exists.
    const cleared = await clearSelectionForUsers(
      payload,
      docs.map(({ id }) => String(id)),
    )

    for (const doc of docs) {
      await payload.delete({
        collection: CollectionSlug.PayloadQueryPresets,
        id: doc.id,
      })
      console.info(`removed preset: ${doc.title}`)
    }

    console.info(
      `\nClean complete: ${docs.length} preset(s) removed, ${cleared} selection(s) cleared.`,
    )
    process.exit(0)
  }

  let created = 0
  const presetIdByCollection = new Map<string, string>()

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
      presetIdByCollection.set(preset.relatedCollection, String(docs[0].id))
      console.info(`exists, skipped: ${preset.title}`)
      continue
    }

    const doc = await payload.create({
      collection: CollectionSlug.PayloadQueryPresets,
      data: preset,
    })
    presetIdByCollection.set(preset.relatedCollection, String(doc.id))
    created++
    console.info(`created preset: ${preset.title}`)
  }

  const selected = await applyAsDefaultForUsers(payload, presetIdByCollection)

  console.info(
    `\nSeed complete: ${created} new preset(s), selected for ${selected} user preference(s).`,
  )
  process.exit(0)
}

await run()
