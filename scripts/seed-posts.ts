/**
 *    Seeds fixture BlogPosts (each with a placeholder hero image and a
 *    generated article) for local testing.
 *
 *    Usage:
 *      pnpm seed:posts               # create 10 seed posts
 *      pnpm seed:posts -- --count 25 # create 25 seed posts
 *      pnpm seed:posts:clean         # remove all seeded posts and their media
 *
 *    Idempotent: existing seeded posts (matched by slug) are skipped, not
 *    duplicated. Creates its own seeded topics if too few exist — running
 *    this alone (without pnpm seed:topics first) is fully supported. See
 *    src/lib/seed/posts.ts for the actual create/delete logic.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { cleanPosts, seedPosts } from '@/lib/seed/posts'

const DEFAULT_COUNT = 10

const payload = await getPayload({
  config,
})

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
  const { deleted, deletedMedia } = await cleanPosts(payload, onProgress)
  console.info(`\nRemoved ${deleted} posts and ${deletedMedia} media documents.`)
} else {
  const { created } = await seedPosts(payload, count, onProgress)
  console.info(`\nCreated ${created} posts.`)
}

process.exit(0)
