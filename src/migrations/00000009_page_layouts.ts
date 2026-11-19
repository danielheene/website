import { randomBytes } from 'node:crypto'

import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { LEGAL_PAGE_SLUGS } from '@/collections/Pages/constants'
import { type Block, blocksToLexical } from '@/lib/migrations/blocksToLexical'
import { CollectionSlug } from '@/types/collections'

type StoredPage = {
  slug?: string
  layout?: string
  content?: unknown
  sections?: unknown
}

const NEW_LAYOUTS = ['richText', 'sections']

// Same 24-hex shape as the ids Payload gives blocks.
const randomBlockId = () => randomBytes(12).toString('hex')

/** `$set`/`$unset` for one page (or one version's `version`), under `prefix`. */
const convertPage = (page: StoredPage, prefix: string) => {
  if (NEW_LAYOUTS.includes(page.layout ?? '')) return null

  const blocks = Array.isArray(page.content) ? (page.content as Block[]) : []
  const isLegal = page.layout === 'legal' || LEGAL_PAGE_SLUGS.includes(page.slug ?? '')

  if (isLegal) {
    return {
      $set: {
        [`${prefix}layout`]: 'richText',
        [`${prefix}content`]: blocksToLexical(blocks),
      },
      $unset: {
        [`${prefix}sections`]: '',
      },
    }
  }

  return {
    $set: {
      [`${prefix}layout`]: 'sections',
      [`${prefix}sections`]: blocks,
    },
    $unset: {
      [`${prefix}content`]: '',
    },
  }
}

/**
 * Pages now have two layouts: `richText` (a `content` rich-text field, like
 * blog posts) and `sections` (the former `content` blocks, now `sections`).
 * The legal pages become rich text with their legal blocks embedded; every
 * other page keeps its blocks as sections.
 *
 * Runs on the documents and their versions through the native driver, since
 * `content` changes type and Mongoose would reject the old shape.
 */
export async function up({ payload, session }: MigrateUpArgs): Promise<void> {
  const pages = payload.db.collections[CollectionSlug.Pages].collection
  const versions = payload.db.versions[CollectionSlug.Pages].collection

  let converted = 0

  for (const page of await pages.find<StoredPage & { _id: unknown }>({}, { session }).toArray()) {
    const update = convertPage(page, '')

    if (!update) continue

    await pages.updateOne({ _id: page._id }, update, { session })
    converted += 1
  }

  const pageVersions = await versions
    .find<{ _id: unknown; version?: StoredPage }>({}, { session })
    .toArray()

  for (const { _id, version } of pageVersions) {
    const update = version ? convertPage(version, 'version.') : null

    if (update) await versions.updateOne({ _id }, update, { session })
  }

  payload.logger.info(`[migrate] pages: converted ${converted} page(s) to the new layouts`)
}

/**
 * Best effort: sections go back to `content` blocks, and rich-text pages become
 * a single RichTextBlock (embedded legal blocks stay inside it).
 */
export async function down({ payload, session }: MigrateDownArgs): Promise<void> {
  const revert = (page: StoredPage, prefix: string) => {
    if (page.layout === 'sections') {
      return {
        $set: {
          [`${prefix}layout`]: page.slug === 'resume' ? 'resume' : 'default',
          [`${prefix}content`]: page.sections ?? [],
        },
        $unset: {
          [`${prefix}sections`]: '',
        },
      }
    }

    if (page.layout === 'richText') {
      return {
        $set: {
          [`${prefix}layout`]: LEGAL_PAGE_SLUGS.includes(page.slug ?? '') ? 'legal' : 'default',
          [`${prefix}content`]: page.content
            ? [
                {
                  id: randomBlockId(),
                  blockType: 'RichTextBlock',
                  content: page.content,
                },
              ]
            : [],
        },
      }
    }

    return null
  }

  const pages = payload.db.collections[CollectionSlug.Pages].collection
  const versions = payload.db.versions[CollectionSlug.Pages].collection

  for (const page of await pages.find<StoredPage & { _id: unknown }>({}, { session }).toArray()) {
    const update = revert(page, '')

    if (update) await pages.updateOne({ _id: page._id }, update, { session })
  }

  for (const { _id, version } of await versions
    .find<{ _id: unknown; version?: StoredPage }>({}, { session })
    .toArray()) {
    const update = version ? revert(version, 'version.') : null

    if (update) await versions.updateOne({ _id }, update, { session })
  }
}
