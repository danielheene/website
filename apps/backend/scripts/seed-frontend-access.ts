/**
 * Creates (or reuses) the API-key user the frontend authenticates with, plus
 * one published Page so the frontend's static generation has content to
 * render.
 *
 * Usage: bun run scripts/seed-frontend-access.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { CollectionSlug } from '@website/types/collections'
import { GlobalSlug } from '@website/types/globals'

const payload = await getPayload({
  config,
})

const apiKey = process.env.PAYLOAD_API_KEY
const email = process.env.PAYLOAD_API_KEY_USER_EMAIL ?? 'frontend@daniel.heene.io'

if (!apiKey) {
  throw new Error('PAYLOAD_API_KEY is not set')
}

const existing = await payload.find({
  collection: CollectionSlug.Users,
  where: { email: { equals: email } },
  limit: 1,
  pagination: false,
})

let userId: string

if (existing.docs[0]) {
  userId = existing.docs[0].id

  await payload.update({
    collection: CollectionSlug.Users,
    id: userId,
    data: { apiKey, role: 'admin' },
  })

  console.log(`Reused user ${email} (${userId})`)
} else {
  const created = await payload.create({
    collection: CollectionSlug.Users,
    data: {
      email,
      password: crypto.randomUUID(),
      apiKey,
      role: 'admin',
    },
  })

  userId = created.id

  console.log(`Created user ${email} (${userId})`)
}

// Site settings must exist or the frontend layout's JSON-LD generators receive
// `undefined`.
//
// `skipUpdateCachedData` keeps the globals' afterChange hooks from calling
// `revalidateTag()`, which needs Next's request-scoped cache store — a
// standalone script has none, and the call would throw. There is no frontend
// cache to invalidate from a seed script anyway.
const siteSettings = await payload.findGlobal({
  slug: GlobalSlug.SiteSettings,
})

if (!siteSettings) {
  await payload.updateGlobal({
    slug: GlobalSlug.SiteSettings,
    data: {},
    context: { skipUpdateCachedData: true },
  })

  console.log('Created SiteSettings global')
}

const globalUserSettings = await payload.findGlobal({
  slug: GlobalSlug.GlobalUserSettings,
})

if (!globalUserSettings) {
  await payload.updateGlobal({
    slug: GlobalSlug.GlobalUserSettings,
    data: {
      firstName: 'Daniel',
      lastName: 'Heene',
    },
    context: { skipUpdateCachedData: true },
  })

  console.log('Created GlobalUserSettings global')
} else if (!globalUserSettings.firstName) {
  await payload.updateGlobal({
    slug: GlobalSlug.GlobalUserSettings,
    data: {
      firstName: 'Daniel',
      lastName: 'Heene',
    },
    context: { skipUpdateCachedData: true },
  })

  console.log('Updated GlobalUserSettings global')
}

// One published page gives the frontend's [slug] route something to prerender.
const pages = await payload.find({
  collection: CollectionSlug.Pages,
  where: { slug: { equals: 'home' } },
  limit: 1,
  pagination: false,
})

if (!pages.docs[0]) {
  await payload.create({
    collection: CollectionSlug.Pages,
    data: {
      slug: 'home',
      title: 'Home',
      protected: false,
      layout: 'default',
      _status: 'published',
    },
  })

  console.log('Created published Page "home"')
}

console.log('Done')

process.exit(0)
