/**
 *    Fills the protected pages with the fixture content they need to render
 *    (résumé block captions, the legal notice's data blocks). Only empty
 *    fields are written, so edited content stays; the baseline migration
 *    applies the same fixtures on a fresh database.
 *
 *    Usage:
 *      bun run seed:fixtures
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { applyPageFixtures } from '@/lib/seed/fixtures'

const payload = await getPayload({
  config,
})

const results = await applyPageFixtures({
  payload,
})

if (results.length === 0) {
  console.info('Nothing to fill: every fixture field already has content.')
}

for (const { slug, changed } of results) {
  console.info(`${slug}: filled ${changed.join(', ')}`)
}

process.exit(0)
