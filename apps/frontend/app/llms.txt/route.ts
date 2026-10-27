import { connection } from 'next/server'

import { generateContentURL } from '@website/lib/generateContentURL'
import { CollectionSlug } from '@website/types/collections'

import { fetchSiteSettingsCached } from '@/lib/fetchers'
import { fetchCollection } from '@/lib/payloadClient'

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
  const docs = await fetchCollection<ListedEntry>(collection, {
    where: {
      _status: {
        equals: 'published',
      },
    },
    limit: 10000,
    pagination: false,
    sort: '-updatedAt',
    select: {
      title: true,
      slug: true,
      'meta.description': true,
    },
  })

  return docs.map((doc) => ({
    title: doc.title,
    slug: doc.slug,
    description: (doc as { description?: string }).description ?? undefined,
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

  return [`## ${heading}`, '', ...links, '']
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
    ...(general.description ? [`> ${general.description}`, ''] : []),
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
