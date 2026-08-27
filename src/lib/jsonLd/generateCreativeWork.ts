import type { CreativeWorkLeaf, WithContext } from 'schema-dts'

export interface CreativeWorkData {
  name: string
  additionalType?: string
  description?: string
  url?: string
  image?: string
}

/**
 * Generates CreativeWork JSON-LD
 *
 * @example
 * ```typescript
 * const creativeWorkLd = generateCreativeWork({
 *   name: 'Portfolio Site',
 *   additionalType: 'WebSite',
 *   description: 'A personal portfolio built with Next.js.',
 *   url: 'https://danielheene.io/projects/portfolio',
 *   image: 'https://danielheene.io/projects/portfolio.jpg'
 * })
 * ```
 */
export function generateCreativeWork(data: CreativeWorkData): WithContext<CreativeWorkLeaf> {
  const creativeWork: WithContext<CreativeWorkLeaf> = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: data.name,
  }

  if (data.additionalType) creativeWork.additionalType = data.additionalType
  if (data.description) creativeWork.description = data.description
  if (data.url) creativeWork.url = data.url

  if (data.image) {
    creativeWork.image = {
      '@type': 'ImageObject',
      url: data.image,
    }
  }

  return creativeWork
}
