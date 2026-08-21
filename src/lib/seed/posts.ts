import type { Payload } from 'payload'

import { SHADER_PRESETS } from '@/components/HeroMedia/shaderPresets'
import { generateSlug } from '@/lib/generateSlug'
import {
  chance,
  codeBlock,
  createRandom,
  heading,
  horizontalRule,
  IS_BOLD,
  IS_CODE,
  IS_ITALIC,
  IS_STRIKETHROUGH,
  IS_SUBSCRIPT,
  IS_SUPERSCRIPT,
  IS_UNDERLINE,
  link,
  list,
  paragraph,
  pick,
  pickSome,
  quote,
  root,
  text,
  upload,
} from '@/lib/seed/lexical'
import { seedTopics } from '@/lib/seed/topics'
import { CollectionSlug } from '@/types/collections'
import type { BlogPostData } from '@/types/payload'

export type SeedProgress = {
  step: string
  current: number
  total: number
}

const SEED_PREFIX = 'seeded-dummy'

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
] as const

const postTitleFor = (index: number): string => {
  const base = POST_TITLES[(index - 1) % POST_TITLES.length]
  const cycle = Math.floor((index - 1) / POST_TITLES.length)
  return cycle === 0 ? base : `${base} (${cycle + 1})`
}

const INTROS = [
  'Most teams discover this the hard way, usually two sprints after the decision was made.',
  'There is a version of this that works on day one and a version that still works in year three.',
  'The tooling has improved enormously, which makes the remaining sharp edges easier to miss.',
  'This started as a footnote in a code review and turned into a working convention.',
  'Every project reaches a point where the shortcut stops paying for itself.',
] as const

const BODY_PARAGRAPHS = [
  'The trade-off is rarely between good and bad; it is between two kinds of future work. Picking deliberately is most of the job.',
  'Start from the constraint that actually binds. Everything downstream gets simpler once that is named explicitly.',
  'Conventions beat configuration when the team is small, and configuration beats conventions once it is not. Knowing which side you are on matters more than the choice itself.',
  'Prefer the boring option until you can articulate why it fails. That articulation is the design document.',
  'Measure before optimizing, but measure the thing users feel rather than the thing that is easy to instrument.',
  'A migration nobody can review is a migration nobody can revert. Keep the diff readable and the rollback obvious.',
] as const

const QUOTES = [
  'Content modeling is the part everyone skips and everyone regrets skipping.',
  'The best abstraction is the one you did not need to write.',
  'Every configuration flag is a promise to support two code paths forever.',
  'Fast feedback is worth more than clever architecture.',
] as const

const SECTION_HEADINGS = [
  'Why this matters',
  'Getting the model right',
  'Common pitfalls',
  'Implementation notes',
  'Performance considerations',
  'Testing the result',
  'Where it breaks down',
] as const

const TAKEAWAY_ITEMS = [
  'Name the constraint before naming the solution',
  'Keep the reversible decisions reversible',
  'Push validation to the edges of the system',
  'Document the why, not the what',
  'Delete the abstraction that only has one caller',
  'Make the failure mode loud and early',
] as const

const STEP_ITEMS = [
  'Model the content',
  'Render it end to end',
  'Add the failing test',
  'Ship behind a flag',
  'Measure, then remove the flag',
] as const

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
] as const

/**
 * Builds a full article exercising the features of the 'post' editor
 * variant: headings, inline formatting, links, lists, quotes, code blocks,
 * horizontal rules, and (when available) an embedded image or video.
 *
 * `videoIds` is kept for parity with the ported script: nothing in this
 * module seeds `videos`, so it always defaults to `[]` and the branch below
 * never fires in practice. It is deliberately left in place rather than
 * deleted (see the design spec).
 *
 * Ported from scripts/seed-blog.ts's lexicalArticle, using the shared
 * src/lib/seed/lexical builders instead of private copies. Structure and
 * prose are randomized per title so the seeded corpus has varied length
 * and shape.
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

    if (imageIds.length > 0 && sectionIndex === 1 && chance(random, 0.5)) {
      nodes.push(upload('images', pick(random, imageIds)))
    }

    // Parity branch from the ported generator: inert unless videos are
    // seeded, which nothing here does.
    if (videoIds.length > 0 && sectionIndex === 0 && chance(random, 0.4)) {
      nodes.push(upload('videos', pick(random, videoIds)))
    }

    if (chance(random, 0.25)) {
      nodes.push(horizontalRule())
    }
  })

  if (chance(random, 0.5)) {
    nodes.push(heading('In practice', 'h2'))
    nodes.push(list(pickSome(random, STEP_ITEMS, 3), 'number'))
  }

  nodes.push(
    paragraph(
      'Seed data should look like the real thing — otherwise the layout only breaks in production.',
    ),
  )

  return root(nodes) as unknown as BlogPostData['content']
}

const createSeedImage = async (payload: Payload, index: number): Promise<string> => {
  const filename = `${SEED_PREFIX}-post-${index}.jpg`
  const source = `https://picsum.photos/seed/${SEED_PREFIX}-post-${index}/1600/900`

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
      alt: `Placeholder image for seeded post ${index}`,
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
 * Resolves `count` topic ids to relate a seeded post to: reuses existing
 * seeded-dummy topics first, creating only the shortfall via `seedTopics` —
 * so `seedPosts` never requires topics to be seeded first as a manual
 * prerequisite.
 *
 * `seedTopics(payload, N)` is idempotent-by-slug, not "create N more": it
 * walks the title pool from index 1 and skips any slot whose slug already
 * exists, so requesting exactly the shortfall can under-create when some of
 * those pool slots are already taken. To guarantee `count` ids regardless,
 * request a growing batch and re-check until the count is actually met.
 * `topicFor`'s cycling (it appends " 2", " 3", ... once the base pool is
 * exhausted) means a large enough request always eventually mints enough
 * *new* topics, so this is bounded rather than truly unbounded — the
 * iteration cap is just a defensive backstop.
 */
const resolveTopicIds = async (payload: Payload, count: number): Promise<string[]> => {
  const findSeededTopics = async () => {
    const { docs } = await payload.find({
      collection: CollectionSlug.BlogTopics,
      where: {
        generatorFlags: {
          in: [
            'seeded-dummy',
          ],
        },
      },
      limit: count,
      pagination: false,
      trash: true,
    })
    return docs.map((topic) => String(topic.id))
  }

  let ids = await findSeededTopics()

  const MAX_ATTEMPTS = 10
  for (let attempt = 1; ids.length < count && attempt <= MAX_ATTEMPTS; attempt += 1) {
    // Request more than the raw shortfall each attempt: seedTopics may skip
    // pool slots that already exist (possibly outside the `count` we can
    // see here, e.g. from concurrent seeding), so asking for exactly the
    // shortfall can repeat the same under-creation. Growing the request
    // size each attempt guarantees progress within the pool's cycling.
    const shortfall = count - ids.length
    await seedTopics(payload, shortfall * attempt)
    ids = await findSeededTopics()
  }

  if (ids.length < count) {
    // Hoisted resolution means a single short-return now affects every post
    // in the run, so make it visible rather than silently degrading.
    payload.logger.warn(
      `resolveTopicIds: wanted ${count} seeded topics, resolved ${ids.length} after ${MAX_ATTEMPTS} attempts`,
    )
  }

  return ids.slice(0, count)
}

/**
 * Creates `count` fixture BlogPosts, each with a downloaded hero image, a
 * full generated article, and 1-2 related topics — creating its own
 * seeded topics if too few already exist. Idempotent by slug, tagged
 * `generatorFlags: ['seeded-dummy']`.
 */
export const seedPosts = async (
  payload: Payload,
  count: number,
  onProgress?: (progress: SeedProgress) => void,
): Promise<{
  created: number
}> => {
  let created = 0

  // Resolve a topic pool sized to the corpus (not just the 1-2 any single
  // post needs) exactly once: per-post resolution meant a redundant find
  // round-trip per post and handed every post the same leading topic(s).
  // Each post then rotates into this wider pool by index so topics spread
  // across the whole corpus, not just alternate between two. Capped at
  // MAX_TOPIC_POOL_SIZE so a large --count doesn't demand an equally large
  // topic pool — seedTopics' own title pool cycles with numeric suffixes
  // past that point anyway, which buys nothing for post-topic variety.
  const MAX_TOPICS_PER_POST = 2
  const MAX_TOPIC_POOL_SIZE = 6
  const topicPoolSize = Math.max(MAX_TOPICS_PER_POST, Math.min(count, MAX_TOPIC_POOL_SIZE))
  const availableTopicIds = count > 0 ? await resolveTopicIds(payload, topicPoolSize) : []

  for (let index = 1; index <= count; index += 1) {
    const title = postTitleFor(index)
    const slug = `${SEED_PREFIX}-post-${generateSlug(title)}`

    onProgress?.({
      step: `Checking ${slug}`,
      current: index,
      total: count,
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
      trash: true,
    })

    if (existing.length > 0) {
      continue
    }

    const random = createRandom(slug)
    const useShader = chance(random, 0.25)

    let imageId: string | undefined
    let background: BlogPostData['hero']['background']
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

      imageId = await createSeedImage(payload, index)

      background = {
        backgroundType: 'media',
        media: {
          relationTo: 'images',
          value: imageId,
        },
      }
    }

    const topicCount = Math.min(1 + (index % 3 === 0 ? 1 : 0), availableTopicIds.length)
    const offset = availableTopicIds.length > 0 ? index % availableTopicIds.length : 0
    const topicIds = Array.from(
      {
        length: topicCount,
      },
      (_unused, slot) => availableTopicIds[(offset + slot) % availableTopicIds.length],
    )

    onProgress?.({
      step: `Creating ${slug}`,
      current: index,
      total: count,
    })

    await payload.create({
      collection: CollectionSlug.BlogPosts,
      context: {
        skipRevalidate: true,
      },
      data: {
        title,
        slug,
        hero: {
          background,
        },
        topics: topicIds.map((id) => ({
          relationTo: 'topics' as const,
          value: id,
        })),
        content: lexicalArticle({
          title,
          imageIds: imageId
            ? [
                imageId,
              ]
            : [],
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
 * Deletes every seeded-dummy BlogPosts document, then deletes the hero
 * image each one referenced — but only if that image still carries
 * seeded-dummy at delete time, the same live re-check `cleanPages` uses.
 * Does not touch BlogTopics; run `cleanTopics` separately for that.
 */
export const cleanPosts = async (
  payload: Payload,
  onProgress?: (progress: SeedProgress) => void,
): Promise<{
  deleted: number
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
    trash: true,
  })

  const mediaIds = new Set<string>()
  for (const post of posts) {
    const media = post.hero?.background?.media
    if (media && typeof media === 'object' && media.relationTo === 'images') {
      const { value } = media
      mediaIds.add(typeof value === 'string' ? value : String(value.id))
    }
  }

  let deleted = 0
  for (const [index, post] of posts.entries()) {
    onProgress?.({
      step: `Deleting ${post.slug}`,
      current: index + 1,
      total: posts.length,
    })

    await payload.delete({
      collection: CollectionSlug.BlogPosts,
      id: post.id,
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
