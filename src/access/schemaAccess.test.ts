import type { CollectionConfig, GlobalConfig } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { COLLECTIONS } from '@/collections'
import { Redirects } from '@/collections/Redirects'
import { References } from '@/collections/References'
import { GLOBALS } from '@/globals'

import { authenticatedOrPublished } from './authenticatedOrPublished'

// Schema configs import fetchers that import the Payload config, which in turn
// imports these schemas; the config itself is not needed to inspect access.
vi.mock('@payload-config', () => ({
  default: {},
}))

const hasDrafts = ({ versions }: CollectionConfig | GlobalConfig): boolean =>
  typeof versions === 'object' && versions !== null && Boolean(versions.drafts)

const schemas = [
  // Redirects and References are registered through plugins in
  // payload.config.ts rather than COLLECTIONS
  ...[
    ...COLLECTIONS,
    Redirects,
    References,
  ].map((config) => ({
    kind: 'collection',
    config,
  })),
  ...GLOBALS.map((config) => ({
    kind: 'global',
    config,
  })),
]

/**
 * Publishable schemas (drafts enabled) must hide unpublished documents from
 * unauthenticated reads, and nothing else may use authenticatedOrPublished:
 * without drafts there is no `_status` field, so its where-constraint breaks
 * every access-enforced read.
 */
describe('read access follows the drafts setting', () => {
  it.each(schemas.filter(({ config }) => hasDrafts(config)))(
    '$kind $config.slug (drafts) reads with authenticatedOrPublished',
    ({ config }) => {
      expect(config.access?.read).toBe(authenticatedOrPublished)
    },
  )

  it.each(schemas.filter(({ config }) => !hasDrafts(config)))(
    '$kind $config.slug (no drafts) does not read with authenticatedOrPublished',
    ({ config }) => {
      expect(config.access?.read).not.toBe(authenticatedOrPublished)
    },
  )
})
