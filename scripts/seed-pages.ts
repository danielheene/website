/**
 *    Seeds fixture Pages (each with a placeholder hero image) for local
 *    testing.
 *
 *    Usage:
 *      pnpm seed:pages               # create 10 seed pages
 *      pnpm seed:pages -- --count 25 # create 25 seed pages
 *      pnpm seed:pages:clean         # remove all seeded pages and their media
 *
 *    Idempotent: existing seeded pages (matched by slug) are skipped, not
 *    duplicated. See src/lib/seed/pages.ts for the actual create/delete
 *    logic — this script only parses arguments and reports progress.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { cleanPages, seedPages } from '@/lib/seed/pages'

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
  const { deleted, deletedMedia } = await cleanPages(payload, onProgress)
  console.info(`\nRemoved ${deleted} pages and ${deletedMedia} media documents.`)
} else {
  const { created } = await seedPages(payload, count, onProgress)
  console.info(`\nCreated ${created} pages.`)
}

process.exit(0)
