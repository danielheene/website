/**
 *    Seeds fixture BlogTopics for local testing.
 *
 *    Usage:
 *      pnpm seed:topics               # create 6 seed topics
 *      pnpm seed:topics -- --count 10 # create 10 seed topics
 *      pnpm seed:topics:clean         # remove seeded topics not still
 *                                      # referenced by a real (non-seeded) post
 *
 *    Idempotent: existing seeded topics (matched by slug) are skipped, not
 *    duplicated. See src/lib/seed/topics.ts for the actual create/delete
 *    logic — this script only parses arguments and reports progress.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { cleanTopics, seedTopics } from '@/lib/seed/topics'

const DEFAULT_COUNT = 6

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
  const { deleted, skipped } = await cleanTopics(payload, onProgress)
  console.info(
    `\nRemoved ${deleted} topics.` +
      (skipped > 0 ? ` Skipped ${skipped} still referenced by a non-seeded post.` : ''),
  )
} else {
  const { created } = await seedTopics(payload, count, onProgress)
  console.info(`\nCreated ${created} topics.`)
}

process.exit(0)
