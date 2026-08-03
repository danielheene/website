import type { CollectionPage, WithContext } from 'schema-dts'

export interface CollectionPageData {
  name: string
  description?: string
  url: string
}

/**
 * Generates CollectionPage JSON-LD
 *
 * @example
 * ```
 * const collectionPageLd = generateCollectionPage({
 *   name: 'Category: TypeScript',
 *   description: 'Posts categorized under TypeScript.',
 *   url: 'https://daniel.heene.io/blog/categories/typescript'
 * })
 * ```
 */
export function generateCollectionPage(data: CollectionPageData): WithContext<CollectionPage> {
  const collectionPage: WithContext<CollectionPage> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: data.name,
    url: data.url,
  }

  if (data.description) {
    collectionPage.description = data.description
  }

  return collectionPage
}
