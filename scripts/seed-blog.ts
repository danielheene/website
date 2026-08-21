/**
 *    Seeds blog topics and posts for local testing.
 *
 *    Usage:
 *      pnpm seed:blog                # create seed data (all posts)
 *      pnpm seed:blog -- --count 10  # create only the first 10 posts
 *      pnpm seed:blog:clean          # remove seed data
 *
 *    Idempotent: existing documents (matched by slug) are skipped, not
 *    duplicated. See src/lib/seed/blog.ts for the actual create/delete
 *    logic — this script only parses arguments and reports progress.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { cleanBlog, seedBlog } from '@/lib/seed/blog'

/** Matches the full POST_TITLES pool in src/lib/seed/blog.ts. */
const DEFAULT_COUNT = 30

const payload = await getPayload({
  config,
})

// NOTE: `payload run` only forwards arguments after a `--` separator, which
// is why the package.json scripts include it.
const clean = process.argv.includes('--clean')
const countIndex = process.argv.indexOf('--count')
const count =
  countIndex !== -1 && process.argv[countIndex + 1]
    ? Number.parseInt(process.argv[countIndex + 1], 10)
    : DEFAULT_COUNT

const onProgress = ({ step, current, total }: { step: string; current: number; total: number }) => {
  console.info(`[${current}/${total}] ${step}`)
}

if (clean) {
  const { deletedPosts, deletedTopics, deletedMedia } = await cleanBlog(payload, onProgress)
  console.info(
    `\nRemoved ${deletedPosts} posts, ${deletedTopics} topics and ${deletedMedia} images.`,
  )
} else {
  const { created } = await seedBlog(payload, count, onProgress)
  console.info(`\nSeed complete: ${created} new posts.`)
}

process.exit(0)
