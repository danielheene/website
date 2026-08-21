import type { Payload } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { CollectionSlug } from '@/types/collections'
import type { BlogPostData } from '@/types/payload'

export type SeedProgress = {
  step: string
  current: number
  total: number
}

const TOPICS = [
  {
    title: 'TypeScript',
    featured: true,
  },
  {
    title: 'Next.js',
    featured: true,
  },
  {
    title: 'Payload CMS',
    featured: true,
  },
  {
    title: 'DevOps',
    featured: false,
  },
  {
    title: 'Design Systems',
    featured: false,
  },
  {
    title: 'Testing',
    featured: true,
  },
]

const POST_TITLES = [
  'Getting started with strict TypeScript configs',
  'Server Components explained with real examples',
  'Modeling content in Payload without regrets',
  'CI pipelines that stay fast as the repo grows',
  'Design tokens that survive a rebrand',
  'Writing unit tests people actually maintain',
  'Advanced generics without the headache',
  'Streaming and Suspense in production',
  'Access control patterns for Payload collections',
  'Docker Compose setups for local development',
  'Component APIs that scale with the team',
  'E2E testing CMS-driven pages',
  'Discriminated unions as an architecture tool',
  'Caching strategies for App Router',
  'Payload hooks: the good, the bad, the loops',
  'Zero-downtime deployments on a budget',
  'Dark mode without the flash of wrong theme',
  'Mocking less, testing more',
  'Type-safe environment variables end to end',
  'Partial prerendering in practice',
  'Migrating legacy content into Payload',
  'Observability for side projects',
  'Accessible focus management in modals',
  'Property-based testing for parsers',
  'Branded types for domain safety',
  'Route handlers vs server actions',
  'Versioned APIs with Payload globals',
  'Secrets management for solo developers',
  'Animating layout changes responsibly',
  'Snapshot tests: when they help, when they hurt',
]

/** Filename prefix identifying downloaded seed images, so cleanup can find them. */
const SEED_IMAGE_PREFIX = 'seed-blog'

const SEED_IMAGE_TOPICS = [
  'workspace',
  'code',
  'architecture',
  'network',
  'terminal',
  'notebook',
  'server-room',
  'whiteboard',
]

const seedSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/* -------------- Lexical node builders --------------
 *
 *    Node shapes mirror what the Lexical editor actually persists (verified
 *    against existing documents). Text formats are a bitmask — see IS_* below,
 *    matching src/components/RichText/nodeFormat.tsx.
 */

const IS_BOLD = 1
const IS_ITALIC = 1 << 1
const IS_STRIKETHROUGH = 1 << 2
const IS_UNDERLINE = 1 << 3
const IS_CODE = 1 << 4
const IS_SUBSCRIPT = 1 << 5
const IS_SUPERSCRIPT = 1 << 6

type TextFormat = number

const text = (value: string, format: TextFormat = 0) => ({
  type: 'text',
  version: 1,
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text: value,
})

type InlineNode = ReturnType<typeof text> | Record<string, unknown>

const paragraph = (children: InlineNode[] | string, format: '' | 'center' | 'right' = '') => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr',
  format,
  indent: 0,
  textFormat: 0,
  textStyle: '',
  children:
    typeof children === 'string'
      ? [
          text(children),
        ]
      : children,
})

const heading = (value: string, tag: 'h2' | 'h3' | 'h4' = 'h2') => ({
  type: 'heading',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  tag,
  children: [
    text(value),
  ],
})

const quote = (value: string) => ({
  type: 'quote',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: [
    text(value),
  ],
})

/**
 * Link node for the project's custom LinkField (`src/fields/Link/index.ts`):
 * Payload's Lexical link validator runs `node.fields` directly against that
 * field's inner field schema (`LinkField().fields`) — so unlike a plain
 * `{ label, url }` shape, the fields belong flat on `node.fields`, not
 * nested under a `link` key. `reference`'s `validate` accepts either a
 * `reference` or a `url`, so a custom-URL link is sent with `reference: null`
 * explicitly.
 */
const link = (value: string, url: string) => ({
  type: 'link',
  version: 3,
  direction: 'ltr',
  format: '',
  indent: 0,
  fields: {
    newTab: true,
    label: value,
    url,
    reference: null,
  },
  children: [
    text(value),
  ],
})

const list = (items: (string | InlineNode[])[], listType: 'bullet' | 'number' | 'check') => ({
  type: 'list',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  listType,
  start: 1,
  tag: listType === 'number' ? 'ol' : 'ul',
  children: items.map((item, index) => ({
    type: 'listitem',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    value: index + 1,
    checked: listType === 'check' ? index % 2 === 0 : undefined,
    children:
      typeof item === 'string'
        ? [
            text(item),
          ]
        : item,
  })),
})

const horizontalRule = () => ({
  type: 'horizontalrule',
  version: 1,
})

const upload = (relationTo: 'images' | 'videos', value: string) => ({
  type: 'upload',
  version: 3,
  format: '',
  fields: null,
  relationTo,
  value,
})

const codeBlock = (code: string, language: 'typescript' | 'javascript' | 'css' = 'typescript') => ({
  type: 'block',
  version: 2,
  format: '',
  fields: {
    blockType: 'CodeBlock',
    blockName: '',
    code,
    language,
  },
})

/**
 * Wraps nodes in a Lexical root. The cast keeps the builders above readable —
 * Payload's generated rich-text type demands exact literal unions for
 * `direction`/`format` that every node would otherwise have to restate.
 */
const root = (children: Record<string, unknown>[]) =>
  ({
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children,
    },
  }) as unknown as BlogPostData['content']

/** Minimal single-paragraph document (used for topic descriptions). */
const lexicalParagraph = (value: string) =>
  root([
    paragraph(value),
  ])

/* -------------- Deterministic randomness -------------- */

/**
 * Seeded PRNG (mulberry32) so a given post title always produces the same
 * article: reruns stay idempotent and diffs remain reviewable, while each
 * post still gets a distinct structure.
 */
const createRandom = (seed: string) => {
  let hash = 1779033703 ^ seed.length
  for (let index = 0; index < seed.length; index++) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353)
    hash = (hash << 13) | (hash >>> 19)
  }

  let state = hash >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Random = ReturnType<typeof createRandom>

const pick = <T>(random: Random, items: readonly T[]): T =>
  items[Math.floor(random() * items.length)]

const pickSome = <T>(random: Random, items: readonly T[], count: number): T[] =>
  [
    ...items,
  ]
    .sort(() => random() - 0.5)
    .slice(0, count)

const chance = (random: Random, probability: number) => random() < probability

/* -------------- Prose fragments -------------- */

const INTROS = [
  'Most teams discover this the hard way, usually two sprints after the decision was made.',
  'There is a version of this that works on day one and a version that still works in year three.',
  'The tooling has improved enormously, which makes the remaining sharp edges easier to miss.',
  'This started as a footnote in a code review and turned into a working convention.',
  'Every project reaches a point where the shortcut stops paying for itself.',
]

const BODY_PARAGRAPHS = [
  'The trade-off is rarely between good and bad; it is between two kinds of future work. Picking deliberately is most of the job.',
  'Start from the constraint that actually binds. Everything downstream gets simpler once that is named explicitly.',
  'Conventions beat configuration when the team is small, and configuration beats conventions once it is not. Knowing which side you are on matters more than the choice itself.',
  'Prefer the boring option until you can articulate why it fails. That articulation is the design document.',
  'Measure before optimizing, but measure the thing users feel rather than the thing that is easy to instrument.',
  'A migration nobody can review is a migration nobody can revert. Keep the diff readable and the rollback obvious.',
]

const QUOTES = [
  'Content modeling is the part everyone skips and everyone regrets skipping.',
  'The best abstraction is the one you did not need to write.',
  'Every configuration flag is a promise to support two code paths forever.',
  'Fast feedback is worth more than clever architecture.',
]

const SECTION_HEADINGS = [
  'Why this matters',
  'Getting the model right',
  'Common pitfalls',
  'Implementation notes',
  'Performance considerations',
  'Testing the result',
  'Where it breaks down',
]

const TAKEAWAY_ITEMS = [
  'Name the constraint before naming the solution',
  'Keep the reversible decisions reversible',
  'Push validation to the edges of the system',
  'Document the why, not the what',
  'Delete the abstraction that only has one caller',
  'Make the failure mode loud and early',
]

const STEP_ITEMS = [
  'Model the content',
  'Render it end to end',
  'Add the failing test',
  'Ship behind a flag',
  'Measure, then remove the flag',
]

const CODE_SNIPPETS: {
  code: string
  language: 'typescript' | 'javascript' | 'css'
}[] = [
  {
    language: 'typescript',
    code: `export const load = async (slug: string) => {\n  'use cache'\n  cacheTag('posts')\n\n  return payload.find({\n    collection: 'posts',\n    where: { slug: { equals: slug } },\n  })\n}`,
  },
  {
    language: 'typescript',
    code: `type Result<T, E = Error> =\n  | { ok: true; value: T }\n  | { ok: false; error: E }\n\nexport const attempt = async <T>(fn: () => Promise<T>): Promise<Result<T>> => {\n  try {\n    return { ok: true, value: await fn() }\n  } catch (error) {\n    return { ok: false, error: error as Error }\n  }\n}`,
  },
  {
    language: 'javascript',
    code: `const debounce = (fn, wait) => {\n  let timer\n  return (...args) => {\n    clearTimeout(timer)\n    timer = setTimeout(() => fn(...args), wait)\n  }\n}`,
  },
  {
    language: 'css',
    code: `.prose :where(pre) {\n  overflow-x: auto;\n  border-radius: 0.5rem;\n  padding-block: 1rem;\n}`,
  },
]

const LINKS = [
  {
    label: 'Payload docs',
    url: 'https://payloadcms.com/docs',
  },
  {
    label: 'the Next.js caching guide',
    url: 'https://nextjs.org/docs/app/getting-started/caching',
  },
  {
    label: 'the TypeScript handbook',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
  },
]

/**
 * Builds a full article exercising the features of the 'post' editor variant:
 * headings, inline formatting, links, lists, quotes, code blocks, horizontal
 * rules and embedded image/video uploads.
 *
 * Structure and prose are randomized per title (see `createRandom`) so the
 * seeded corpus has varied length and shape rather than 30 identical articles.
 */
const lexicalArticle = ({
  title,
  imageIds = [],
  videoIds = [],
}: {
  title: string
  imageIds?: string[]
  videoIds?: string[]
}) => {
  const random = createRandom(title)
  const nodes: Record<string, unknown>[] = []

  /* -------------- Lede -------------- */
  nodes.push(
    paragraph([
      text(`${pick(random, INTROS)} `),
      text(title, IS_BOLD),
      text(' is no exception — the details below are what actually changed the outcome.'),
    ]),
  )

  if (chance(random, 0.6)) {
    nodes.push(
      paragraph([
        text('Formatting sampler: '),
        text('bold', IS_BOLD),
        text(', '),
        text('italic', IS_ITALIC),
        text(', '),
        text('underline', IS_UNDERLINE),
        text(', '),
        text('strikethrough', IS_STRIKETHROUGH),
        text(', '),
        text('inline code', IS_CODE),
        text(', sub'),
        text('script', IS_SUBSCRIPT),
        text(' and super'),
        text('script', IS_SUPERSCRIPT),
        text('.'),
      ]),
    )
  }

  /* -------------- Lead image -------------- */
  if (imageIds.length > 0 && chance(random, 0.8)) {
    nodes.push(upload('images', pick(random, imageIds)))
    if (chance(random, 0.5)) {
      nodes.push(
        paragraph([
          text('An embedded image node, captioned like an editor would.', IS_ITALIC),
        ]),
      )
    }
  }

  /* -------------- Body sections -------------- */
  const headings = pickSome(random, SECTION_HEADINGS, 2 + Math.floor(random() * 3))

  headings.forEach((sectionHeading, sectionIndex) => {
    nodes.push(heading(sectionHeading, chance(random, 0.3) ? 'h3' : 'h2'))

    nodes.push(paragraph(pick(random, BODY_PARAGRAPHS)))

    if (chance(random, 0.45)) {
      const linkTarget = pick(random, LINKS)
      nodes.push(
        paragraph([
          text('There is more background in '),
          link(linkTarget.label, linkTarget.url),
          text(', which covers the edge cases this glosses over.'),
        ]),
      )
    }

    if (chance(random, 0.55)) {
      nodes.push(
        list(
          pickSome(random, TAKEAWAY_ITEMS, 2 + Math.floor(random() * 3)),
          pick(random, [
            'bullet',
            'number',
            'check',
          ] as const),
        ),
      )
    }

    if (chance(random, 0.4)) {
      const snippet = pick(random, CODE_SNIPPETS)
      nodes.push(codeBlock(snippet.code, snippet.language))
    }

    if (chance(random, 0.3)) {
      nodes.push(quote(pick(random, QUOTES)))
    }

    // an extra image partway through longer articles
    if (imageIds.length > 0 && sectionIndex === 1 && chance(random, 0.5)) {
      nodes.push(upload('images', pick(random, imageIds)))
    }

    if (chance(random, 0.25)) {
      nodes.push(horizontalRule())
    }
  })

  /* -------------- Optional video -------------- */
  if (videoIds.length > 0 && chance(random, 0.35)) {
    nodes.push(heading('Watch it in action', 'h3'))
    nodes.push(upload('videos', pick(random, videoIds)))
  }

  /* -------------- Ordered wrap-up -------------- */
  if (chance(random, 0.5)) {
    nodes.push(heading('In practice', 'h2'))
    nodes.push(list(pickSome(random, STEP_ITEMS, 3), 'number'))
  }

  nodes.push(
    paragraph(
      'Seed data should look like the real thing — otherwise the layout only breaks in production.',
    ),
  )

  return root(nodes)
}

/**
 * Downloads a placeholder image for the given keyword and creates it in
 * `MediaImages`, tagged `seeded-dummy`. Deterministic per keyword (via
 * picsum.photos' `seed` parameter) so reruns fetch the same picture.
 */
const createSeedImage = async (
  payload: Payload,
  index: number,
  keyword: string,
): Promise<string> => {
  const filename = `${SEED_IMAGE_PREFIX}-${index}-${keyword}.jpg`
  const source = `https://picsum.photos/seed/${SEED_IMAGE_PREFIX}-${keyword}/1600/900`

  const response = await fetch(source)
  if (!response.ok) throw new Error(`Failed to download placeholder image: HTTP ${response.status}`)

  const data = Buffer.from(await response.arrayBuffer())

  const created = await payload.create({
    collection: CollectionSlug.MediaImages,
    context: {
      skipRevalidate: true,
      // keeps the AI alt-text hook from firing repeatedly against a real API
      skipGenerateAlt: true,
    },
    data: {
      alt: `Stock photograph representing ${keyword.replace(/-/g, ' ')}`,
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
 * Ensures the shared pool of seed images exists (one per `SEED_IMAGE_TOPICS`
 * entry), downloading whatever is missing. Reused across every seeded post
 * rather than fetched per-post, since the pool is small and shared.
 *
 * A download failure is logged and skipped rather than aborting the whole
 * run — articles just seed with fewer embedded images.
 */
const ensureSeedImages = async (
  payload: Payload,
  onProgress?: (progress: SeedProgress) => void,
): Promise<string[]> => {
  const { docs: existing } = await payload.find({
    collection: CollectionSlug.MediaImages,
    where: {
      filename: {
        like: SEED_IMAGE_PREFIX,
      },
    },
    pagination: false,
    limit: 0,
  })

  if (existing.length >= SEED_IMAGE_TOPICS.length) {
    return existing.map(({ id }) => String(id))
  }

  const ids: string[] = existing.map(({ id }) => String(id))

  for (const [index, keyword] of SEED_IMAGE_TOPICS.entries()) {
    const filename = `${SEED_IMAGE_PREFIX}-${index + 1}-${keyword}.jpg`
    if (existing.some((doc) => doc.filename === filename)) continue

    onProgress?.({
      step: `Downloading seed image: ${keyword}`,
      current: index + 1,
      total: SEED_IMAGE_TOPICS.length,
    })

    try {
      ids.push(await createSeedImage(payload, index + 1, keyword))
    } catch (error) {
      console.warn(`failed to fetch seed image "${keyword}":`, (error as Error).message)
    }
  }

  return ids
}

/**
 * Creates the fixed set of blog topics (idempotent by slug) and up to
 * `postCount` posts drawn from a fixed title pool (idempotent by slug,
 * topping up rather than duplicating on a rerun with a larger count),
 * exercising the full range of the post editor: headings, formatting,
 * links, lists, quotes, code blocks, and embedded image/video uploads.
 *
 * Every created document — topics, posts, and the downloaded placeholder
 * images — is tagged `generatorFlags: ['seeded-dummy']` so `cleanBlog` can
 * find and remove them later.
 */
export const seedBlog = async (
  payload: Payload,
  postCount: number,
  onProgress?: (progress: SeedProgress) => void,
): Promise<{
  created: number
}> => {
  /* -------------- Topics -------------- */
  const topicIds: string[] = []
  for (const [index, topic] of TOPICS.entries()) {
    const slug = seedSlug(topic.title)

    onProgress?.({
      step: `Checking topic ${slug}`,
      current: index + 1,
      total: TOPICS.length,
    })

    const { docs: existing } = await payload.find({
      collection: CollectionSlug.BlogTopics,
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      pagination: false,
    })

    if (existing[0]) {
      topicIds.push(String(existing[0].id))
      continue
    }

    onProgress?.({
      step: `Creating topic ${slug}`,
      current: index + 1,
      total: TOPICS.length,
    })

    const created = await payload.create({
      collection: CollectionSlug.BlogTopics,
      context: {
        skipRevalidate: true,
      },
      data: {
        title: topic.title,
        slug,
        featured: topic.featured,
        content: lexicalParagraph(`Posts about ${topic.title}.`),
        generatorFlags: [
          'seeded-dummy',
        ],
      },
    })
    topicIds.push(String(created.id))
  }

  /* -------------- Media pool for embeds -------------- */
  const seedImageIds = await ensureSeedImages(payload, onProgress)

  // fall back to whatever already lives in the collection if downloads failed
  const imageIds =
    seedImageIds.length > 0
      ? seedImageIds
      : (
          await payload.find({
            collection: CollectionSlug.MediaImages,
            limit: 10,
            pagination: false,
          })
        ).docs.map(({ id }) => String(id))

  const { docs: videoDocs } = await payload.find({
    collection: CollectionSlug.MediaVideos,
    limit: 10,
    pagination: false,
  })
  const videoIds = videoDocs.map(({ id }) => String(id))

  /* -------------- Posts -------------- */
  const titles = POST_TITLES.slice(0, postCount)
  let created = 0

  for (const [index, title] of titles.entries()) {
    const slug = seedSlug(title)

    onProgress?.({
      step: `Checking post ${slug}`,
      current: index + 1,
      total: titles.length,
    })

    const { docs: existing } = await payload.find({
      collection: CollectionSlug.BlogPosts,
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      pagination: false,
      draft: true,
    })

    if (existing[0]) {
      continue
    }

    onProgress?.({
      step: `Creating post ${slug}`,
      current: index + 1,
      total: titles.length,
    })

    // 1-2 topics per post, round-robin so every topic gets posts
    const topics = [
      {
        relationTo: 'topics' as const,
        value: topicIds[index % topicIds.length],
      },
      ...(index % 3 === 0
        ? [
            {
              relationTo: 'topics' as const,
              value: topicIds[(index + 1) % topicIds.length],
            },
          ]
        : []),
    ]

    await payload.create({
      collection: CollectionSlug.BlogPosts,
      context: {
        skipRevalidate: true,
      },
      data: {
        title,
        slug,
        topics,
        ...(imageIds.length > 0
          ? {
              heroImage: {
                relationTo: 'images' as const,
                value: imageIds[index % imageIds.length],
              },
            }
          : {}),
        content: lexicalArticle({
          title,
          imageIds,
          videoIds,
        }),
        generatorFlags: [
          'seeded-dummy',
        ],
        _status: 'published',
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
 * Deletes every seeded (`generatorFlags: ['seeded-dummy']`) `BlogPosts` and
 * `BlogTopics` document — including drafts, so a seeded post left in draft
 * status by a partial run or a manual admin edit isn't orphaned — then
 * deletes the seed images those posts referenced, but only images that still
 * carry the `seeded-dummy` flag at delete time, mirroring `cleanPages`'s
 * re-verification: a seeded post's hero could have since been manually
 * repointed at a real, hand-uploaded image in the admin UI, and that image
 * must survive.
 */
export const cleanBlog = async (
  payload: Payload,
  onProgress?: (progress: SeedProgress) => void,
): Promise<{
  deletedPosts: number
  deletedTopics: number
  deletedMedia: number
}> => {
  const { docs: posts } = await payload.find({
    collection: CollectionSlug.BlogPosts,
    where: {
      generatorFlags: {
        in: [
          'seeded-dummy',
        ],
      },
    },
    limit: 0,
    pagination: false,
    draft: true,
  })

  const mediaIds = new Set<string>()
  for (const post of posts) {
    if (post.heroImage?.relationTo === 'images') {
      const { value } = post.heroImage
      mediaIds.add(typeof value === 'string' ? value : String(value.id))
    }
  }

  let deletedPosts = 0
  for (const [index, post] of posts.entries()) {
    onProgress?.({
      step: `Deleting post ${post.slug}`,
      current: index + 1,
      total: posts.length,
    })

    await payload.delete({
      collection: CollectionSlug.BlogPosts,
      id: post.id,
      context: {
        skipRevalidate: true,
      },
    })
    deletedPosts += 1
  }

  const { docs: topics } = await payload.find({
    collection: CollectionSlug.BlogTopics,
    where: {
      generatorFlags: {
        in: [
          'seeded-dummy',
        ],
      },
    },
    limit: 0,
    pagination: false,
  })

  let deletedTopics = 0
  for (const [index, topic] of topics.entries()) {
    onProgress?.({
      step: `Deleting topic ${topic.slug}`,
      current: index + 1,
      total: topics.length,
    })

    try {
      await payload.delete({
        collection: CollectionSlug.BlogTopics,
        id: topic.id,
        context: {
          skipRevalidate: true,
        },
      })
      deletedTopics += 1
    } catch (error) {
      // A seeded topic can end up referenced by a real, hand-created post
      // (the reference-integrity plugin then refuses the delete) — skip it
      // rather than aborting the rest of the cleanup over one topic that
      // isn't safe to remove yet.
      console.warn(`skipped deleting topic "${topic.slug}":`, extractErrorMessage(error))
    }
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
    deletedPosts,
    deletedTopics,
    deletedMedia,
  }
}
