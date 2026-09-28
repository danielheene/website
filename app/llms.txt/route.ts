import { connection } from 'next/server'
import config from '@payload-config'
import { getPayload } from 'payload'

import { fetchSiteSettingsCached } from '@/lib/fetchers'
import { generateContentURL } from '@/lib/generateContentURL'
import { CollectionSlug } from '@/types/collections'

type ListedEntry = {
  title: string
  slug: string
  description?: string
}

type ListedCollection =
  | CollectionSlug['Pages']
  | CollectionSlug['BlogPosts']
  | CollectionSlug['BlogTopics']

const escapeLinkText = (text: string) => text.replace(/[[\]]/g, '')

const escapeDescription = (text: string) =>
  text
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[\\`()[\]]/g, (char) => `\\${char}`)

const getPublishedEntries = async (collection: ListedCollection): Promise<ListedEntry[]> => {
  const payload = await getPayload({
    config,
  })

  const { docs } = await payload.find({
    collection,
    limit: 10000,
    pagination: false,
    draft: false,
    where: {},
    select: {
      title: true,
      slug: true,
      meta: true,
    },
    sort: '-updatedAt',
  })

  return docs.map((doc) => ({
    title: doc.title,
    slug: doc.slug,
    description: doc.meta?.description ?? undefined,
  }))
}

const renderSection = (
  heading: string,
  collection: ListedCollection,
  entries: ListedEntry[],
): string[] => {
  if (entries.length === 0) return []

  const links = entries.map((entry) => {
    const url = generateContentURL({
      collection,
      slug: entry.slug,
    })
    const description = entry.description ? `: ${escapeDescription(entry.description)}` : ''
    return `- [${escapeLinkText(entry.title)}](${url})${description}`
  })

  return [
    `## ${heading}`,
    '',
    ...links,
    '',
  ]
}

export async function GET() {
  await connection()

  const { general } = await fetchSiteSettingsCached()

  const [pages, posts, topics] = await Promise.all([
    getPublishedEntries(CollectionSlug.Pages),
    getPublishedEntries(CollectionSlug.BlogPosts),
    getPublishedEntries(CollectionSlug.BlogTopics),
  ])

  const lines = [
    `# ${general.siteName ?? 'Website'}`,
    '',
    ...(general.description
      ? [
          `> ${general.description}`,
          '',
        ]
      : []),
    ...renderSection('Pages', CollectionSlug.Pages, pages),
    ...renderSection('Blog Posts', CollectionSlug.BlogPosts, posts),
    ...renderSection('Blog Topics', CollectionSlug.BlogTopics, topics),
    '## Resume',
    '',
    `- [Download Resume (PDF)](${generateContentURL({
      path: '/download/resume.pdf',
    })})`,
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
