import type { CollectionPage, WithContext } from 'schema-dts'

export interface CollectionPageData {
  name: string
  description?: string
  url: string
}

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
