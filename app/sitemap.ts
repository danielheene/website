import type { MetadataRoute } from 'next'
import config from '@payload-config'
import { getPayload } from 'payload'

import { generateContentURL } from '@/lib/generateContentURL'
import { CollectionSlug } from '@/types/collections'

type RenderedCollection =
  | CollectionSlug['Pages']
  | CollectionSlug['BlogPosts']
  | CollectionSlug['BlogTopics']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getCollectionSitemapEntries(CollectionSlug['Pages'])
  // const posts = await getCollectionSitemapEntries(
  //   CollectionSlug['BlogPosts'],
  //   true,
  // )
  // const tags = await getCollectionSitemapEntries(CollectionSlug['BlogTopics'], true)

  return [
    ...pages,
    // ...posts,
    // ...tags,
  ]
}

async function getCollectionData(collection: RenderedCollection): Promise<
  Array<{
    slug: string
    updatedAt: string
  }>
> {
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
      slug: true,
      updatedAt: true,
    },
    sort: 'updatedAt',
  })

  return docs.map(({ slug, updatedAt }) => ({
    slug,
    updatedAt,
  }))
}

async function getCollectionSitemapEntries<T extends RenderedCollection>(
  collection: T,
  createIndex: boolean = false,
) {
  const data = await getCollectionData(collection)
  const index = createIndex
    ? [
        {
          slug: '',
          updatedAt: data?.[0]?.updatedAt ?? new Date().toISOString(),
        },
      ]
    : []

  return [
    ...index,
    ...data,
  ].map(({ slug, updatedAt }) => ({
    url: generateContentURL({
      collection,
      slug,
    }),
    lastModified: updatedAt,
  }))
}
