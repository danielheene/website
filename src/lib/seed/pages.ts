import type { Payload } from 'payload'

import { CollectionSlug } from '@/types/collections'
import type { OneColumnContentBlock } from '@/types/payload'

export type SeedProgress = {
  step: string
  current: number
  total: number
}

/** Filename/slug prefix for every document this module creates. */
const SEED_PREFIX = 'seeded-dummy'

const text = (value: string) => ({
  type: 'text',
  version: 1,
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: value,
})

const paragraph = (value: string) => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  children: [
    text(value),
  ],
})

/**
 * Minimal single-paragraph Lexical document, cast to whatever rich-text
 * field type the caller assigns it to. Mirrors `root()` in
 * `scripts/seed-blog.ts`.
 */
const lexicalParagraph = (value: string) =>
  ({
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: [
        paragraph(value),
      ],
    },
  }) as unknown as OneColumnContentBlock['content']

/**
 * Downloads a placeholder image and creates it in `MediaImages`, tagged
 * `seeded-dummy` so `cleanPages` can find and remove it. Reuses
 * `scripts/seed-blog.ts`'s `picsum.photos` approach.
 */
const createSeedImage = async (payload: Payload, index: number): Promise<string> => {
  const filename = `${SEED_PREFIX}-page-${index}.jpg`
  const source = `https://picsum.photos/seed/${SEED_PREFIX}-page-${index}/1600/900`

  const response = await fetch(source)
  if (!response.ok) throw new Error(`Failed to download placeholder image: HTTP ${response.status}`)

  const data = Buffer.from(await response.arrayBuffer())

  const created = await payload.create({
    collection: CollectionSlug.MediaImages,
    context: {
      skipRevalidate: true,
      skipGenerateAlt: true,
    },
    data: {
      alt: `Placeholder image for seeded page ${index}`,
      generatorFlags: [
        'seeded-dummy',
      ],
    },
    file: {
      name: filename,
      data,
      mimetype: 'image/jpeg',
      size: data.byteLength,
    },
  })

  return String(created.id)
}

/**
 * Creates `count` fixture Pages, each with a downloaded hero image and one
 * `OneColumnContentBlock`, all tagged `generatorFlags: ['seeded-dummy']`.
 *
 * Idempotent by slug: a page whose slug already exists is skipped, not
 * duplicated, matching `scripts/seed-blog.ts`'s convention. Re-running with
 * a larger `count` than a previous run tops up to that count rather than
 * creating `count` new pages every time.
 */
export const seedPages = async (
  payload: Payload,
  count: number,
  onProgress?: (progress: SeedProgress) => void,
): Promise<{
  created: number
}> => {
  let created = 0

  for (let index = 1; index <= count; index += 1) {
    const slug = `${SEED_PREFIX}-page-${index}`

    onProgress?.({
      step: `Checking ${slug}`,
      current: index,
      total: count,
    })

    const { docs: existing } = await payload.find({
      collection: CollectionSlug.Pages,
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      pagination: false,
      trash: true,
    })

    if (existing.length > 0) {
      continue
    }

    onProgress?.({
      step: `Creating hero image for ${slug}`,
      current: index,
      total: count,
    })

    const imageId = await createSeedImage(payload, index)

    onProgress?.({
      step: `Creating ${slug}`,
      current: index,
      total: count,
    })

    await payload.create({
      collection: CollectionSlug.Pages,
      context: {
        skipRevalidate: true,
      },
      data: {
        title: `Seeded Dummy Page ${index}`,
        protected: false,
        slug,
        layout: 'default',
        generatorFlags: [
          'seeded-dummy',
        ],
        hero: {
          contentType: 'title',
          media: [
            {
              relationTo: 'images',
              value: imageId,
            },
          ],
        },
        content: [
          {
            blockType: 'OneColumnContentBlock',
            content: lexicalParagraph(
              `This is placeholder content for seeded dummy page ${index}. It exists only for local testing and can be removed with the Clean action.`,
            ),
          },
        ],
      },
      draft: false,
    })

    created += 1
  }

  return {
    created,
  }
}

/**
 * Deletes every `Pages` document tagged `seeded-dummy`, then deletes the
 * `images`-collection media those pages referenced in their hero — but only
 * if that media document itself still carries the `seeded-dummy` flag at
 * delete time. A seeded page's hero could in principle be manually edited
 * in the Payload admin UI to point at a real, hand-uploaded image, so each
 * referenced media id is re-verified with a live `find` before deletion;
 * media that no longer (or never did) carry the flag is left untouched.
 */
export const cleanPages = async (
  payload: Payload,
  onProgress?: (progress: SeedProgress) => void,
): Promise<{
  deletedPages: number
  deletedMedia: number
}> => {
  const { docs: pages } = await payload.find({
    collection: CollectionSlug.Pages,
    where: {
      generatorFlags: {
        in: [
          'seeded-dummy',
        ],
      },
    },
    limit: 0,
    pagination: false,
    trash: true,
  })

  const mediaIds = new Set<string>()
  for (const page of pages) {
    for (const entry of page.hero?.media ?? []) {
      if (entry.relationTo === 'images') {
        mediaIds.add(typeof entry.value === 'string' ? entry.value : String(entry.value.id))
      }
    }
  }

  let deletedPages = 0
  for (const [index, page] of pages.entries()) {
    onProgress?.({
      step: `Deleting ${page.slug}`,
      current: index + 1,
      total: pages.length,
    })

    await payload.delete({
      collection: CollectionSlug.Pages,
      id: page.id,
      context: {
        skipRevalidate: true,
      },
      trash: true,
    })
    deletedPages += 1
  }

  let deletedMedia = 0
  for (const mediaId of mediaIds) {
    const { docs: seededMedia } = await payload.find({
      collection: CollectionSlug.MediaImages,
      where: {
        and: [
          {
            id: {
              equals: mediaId,
            },
          },
          {
            generatorFlags: {
              in: [
                'seeded-dummy',
              ],
            },
          },
        ],
      },
      limit: 1,
      pagination: false,
    })

    if (seededMedia.length === 0) {
      continue
    }

    await payload.delete({
      collection: CollectionSlug.MediaImages,
      id: mediaId,
      context: {
        skipRevalidate: true,
      },
    })
    deletedMedia += 1
  }

  return {
    deletedPages,
    deletedMedia,
  }
}
