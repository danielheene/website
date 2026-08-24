import type { Payload } from 'payload'

import { SHADER_PRESETS } from '@/components/HeroMedia/shaderPresets'
import type { Random } from '@/lib/seed/lexical'
import {
  chance,
  createRandom,
  heading,
  link,
  list,
  paragraph,
  pick,
  pickSome,
  quote,
  root,
  text,
} from '@/lib/seed/lexical'
import { CollectionSlug } from '@/types/collections'
import type { Page } from '@/types/payload'

export type SeedProgress = {
  step: string
  current: number
  total: number
}

/** Filename/slug prefix for every document this module creates. */
const SEED_PREFIX = 'seeded-dummy'

const PAGE_TITLES = [
  'About Our Process',
  'Getting Started',
  'Frequently Asked Questions',
  'Our Team',
  'Pricing',
  'Case Studies',
  'Terms of Service',
  'Privacy Policy',
  'Contact Us',
  'Careers',
  'Press Kit',
  'Community Guidelines',
] as const

const pageTitleFor = (index: number): string => {
  const base = PAGE_TITLES[(index - 1) % PAGE_TITLES.length]
  const cycle = Math.floor((index - 1) / PAGE_TITLES.length)
  return cycle === 0 ? base : `${base} ${cycle + 1}`
}

const SECTION_HEADINGS = [
  'Why this matters',
  'Getting the details right',
  'Common pitfalls',
  'How it works',
  'What to expect',
  'Frequently asked questions',
] as const

const BODY_PARAGRAPHS = [
  'This section exists to give readers the context they need before the specifics below make sense.',
  'Start from the constraint that actually binds. Everything downstream gets simpler once that is named explicitly.',
  'The short version: most of the value comes from doing the basics consistently, not from the exceptions.',
  'Every team eventually settles on an approach here — this is ours, and the reasoning behind it.',
] as const

const TAKEAWAY_ITEMS = [
  'Keep the process documented, not tribal knowledge',
  'Review this regularly, not just when something breaks',
  'Ask early if something here is unclear',
  'Update this page when the process changes',
  'Link back here instead of re-explaining it elsewhere',
] as const

const QUOTES = [
  'Clear documentation is a feature, not an afterthought.',
  'The best process is the one people actually follow.',
] as const

const LINKS = [
  {
    label: 'our documentation',
    url: 'https://example.com/docs',
  },
  {
    label: 'the support center',
    url: 'https://example.com/support',
  },
  {
    label: 'our status page',
    url: 'https://example.com/status',
  },
] as const

const CODE_SNIPPETS: {
  code: string
  language: 'typescript' | 'javascript' | 'css'
}[] = [
  {
    language: 'typescript',
    code: `export const config = {\n  retries: 3,\n  timeoutMs: 5000,\n} as const`,
  },
  {
    language: 'javascript',
    code: `const formatDate = (date) =>\n  new Intl.DateTimeFormat('en-US').format(date)`,
  },
  {
    language: 'css',
    code: `.card {\n  border-radius: 0.5rem;\n  padding: 1rem;\n}`,
  },
]

/** One `OneColumnContentBlock` with 2-3 paragraphs and, sometimes, a heading/list/quote. */
const oneColumnBlock = (random: Random) => {
  const nodes: Record<string, unknown>[] = []

  if (chance(random, 0.5)) {
    nodes.push(heading(pick(random, SECTION_HEADINGS)))
  }

  nodes.push(paragraph(pick(random, BODY_PARAGRAPHS)))
  nodes.push(paragraph(pick(random, BODY_PARAGRAPHS)))

  if (chance(random, 0.4)) {
    const linkTarget = pick(random, LINKS)
    nodes.push(
      paragraph([
        text('For more detail, see '),
        link(linkTarget.label, linkTarget.url),
        text('.'),
      ]),
    )
  }

  if (chance(random, 0.5)) {
    nodes.push(
      list(
        pickSome(random, TAKEAWAY_ITEMS, 2 + Math.floor(random() * 2)),
        pick(random, [
          'bullet',
          'number',
        ] as const),
      ),
    )
  }

  if (chance(random, 0.3)) {
    nodes.push(quote(pick(random, QUOTES)))
  }

  return {
    blockType: 'OneColumnContentBlock',
    content: root(nodes),
  }
}

/** One `TwoColumnContentBlock` with a short paragraph in each column. */
const twoColumnBlock = (random: Random) => ({
  blockType: 'TwoColumnContentBlock',
  contentLeft: root([
    paragraph(pick(random, BODY_PARAGRAPHS)),
  ]),
  contentRight: root([
    paragraph(pick(random, BODY_PARAGRAPHS)),
  ]),
})

/** One `CodeBlock` from the snippet pool. */
const codeContentBlock = (random: Random) => {
  const snippet = pick(random, CODE_SNIPPETS)
  return {
    blockType: 'CodeBlock',
    code: snippet.code,
    language: snippet.language,
  }
}

/** One `LinkGroupBlock` with 2-3 custom-URL entries — no internal relationships, see plan Non-goals. */
const linkGroupBlock = (random: Random) => ({
  blockType: 'LinkGroupBlock',
  links: {
    alignment: 'list',
    entries: pickSome(random, LINKS, 2 + Math.floor(random() * 2)).map((entry) => ({
      link: {
        linkType: 'custom',
        newTab: true,
        label: entry.label,
        url: entry.url,
        doc: null,
      },
    })),
  },
})

const pageBlocks = (seed: string): Page['content'] => {
  const random = createRandom(seed)
  const builders = [
    twoColumnBlock,
    codeContentBlock,
    linkGroupBlock,
  ]

  const blocks: Record<string, unknown>[] = [
    oneColumnBlock(random),
  ]

  const extraCount = 1 + Math.floor(random() * 3) // 1-3 more blocks, total 2-4
  const chosen = pickSome(random, builders, Math.min(extraCount, builders.length))

  for (const build of chosen) {
    blocks.push(build(random))
  }

  // top up with a second OneColumnContentBlock if fewer builders existed
  // than the target extra count (keeps the 2-4 range even as the builder
  // pool is small)
  while (blocks.length < 1 + extraCount) {
    blocks.push(oneColumnBlock(random))
  }

  return blocks as unknown as Page['content']
}

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
 * Creates `count` fixture Pages, each with a downloaded hero image, a title
 * from the shared title pool, and 2-4 varied content blocks (One-Column,
 * Two-Column, Code, Link Group), all tagged `generatorFlags: ['seeded-dummy']`.
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

    const random = createRandom(slug)
    const useShader = chance(random, 0.25)

    let background: Page['hero']['background']
    if (useShader) {
      background = {
        backgroundType: 'shader',
        shader: pick(random, SHADER_PRESETS).key,
      }
    } else {
      onProgress?.({
        step: `Creating hero image for ${slug}`,
        current: index,
        total: count,
      })

      const imageId = await createSeedImage(payload, index)

      background = {
        backgroundType: 'media',
        media: [
          {
            relationTo: 'images',
            value: imageId,
          },
        ],
      }
    }

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
        title: pageTitleFor(index),
        protected: false,
        slug,
        layout: 'default',
        generatorFlags: [
          'seeded-dummy',
        ],
        hero: {
          contentType: 'title',
          background,
        },
        content: pageBlocks(slug),
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
  deleted: number
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
    for (const entry of page.hero?.background?.media ?? []) {
      if (entry.relationTo === 'images') {
        mediaIds.add(typeof entry.value === 'string' ? entry.value : String(entry.value.id))
      }
    }
  }

  let deleted = 0
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
    deleted += 1
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
    deleted,
    deletedMedia,
  }
}
