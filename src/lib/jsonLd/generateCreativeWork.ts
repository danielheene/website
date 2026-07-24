import type { CreativeWork, WithContext } from 'schema-dts'

export interface CreativeWorkData {
  name: string
  description?: string
  image?: string
  url?: string
}

/**
 * Generates CreativeWork JSON-LD
 *
 * @example
 * ```typescript
 * const projectLd = generateCreativeWork({
 *   name: 'Project Name',
 *   description: 'Project description...',
 *   image: 'https://...',
 *   url: 'https://...'
 * })
 * ```
 */
export function generateCreativeWork(data: CreativeWorkData): WithContext<CreativeWork> {
  const creativeWork: WithContext<CreativeWork> = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: data.name,
  }

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
