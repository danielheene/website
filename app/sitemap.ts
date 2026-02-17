import { generateContentURL } from '@/utilities/generateContentURL'
import { CollectionSlug } from '@custom-types'
import config from '@payload-config'
import { MetadataRoute } from 'next'
import { getPayload } from 'payload'

type RenderedCollection = CollectionSlug.Pages | CollectionSlug.BlogPosts | CollectionSlug.BlogCategories | CollectionSlug.BlogTags

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getCollectionSitemapEntries(CollectionSlug.Pages)
  const posts = await getCollectionSitemapEntries(CollectionSlug.BlogPosts, true)
  const categories = await getCollectionSitemapEntries(CollectionSlug.BlogCategories, true)
  const tags = await getCollectionSitemapEntries(CollectionSlug.BlogTags, true)

  return [...pages, ...posts, ...categories, ...tags]
}

async function getCollectionData(collection: RenderedCollection): Promise<Array<{ slug: string; updatedAt: string }>> {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection,
    limit: 10000,
    pagination: false,
    draft: false,
    where: {},
    select: { slug: true, updatedAt: true },
    sort: 'updatedAt',
  })

  return docs.map(({ slug, updatedAt }) => ({ slug, updatedAt }))
}

async function getCollectionSitemapEntries<T extends RenderedCollection>(collection: T, createIndex: boolean = false) {
  const data = await getCollectionData(collection)
  const index = createIndex ? [{ slug: '', updatedAt: data?.[0]?.updatedAt ?? new Date().toISOString() }] : []

  return [...index, ...data].map(({ slug, updatedAt }) => ({
    url: generateContentURL({ collection, slug }).toString(),
    lastModified: updatedAt,
  }))
}
