import type { BlogLeaf, WithContext } from 'schema-dts'

export interface BlogData {
  name: string
  description?: string
  url: string
  image?: string
  keywords?: string[]
}

/**
 * Generates Blog JSON-LD
 *
 * @example
 * ```typescript
 * const blogLd = generateBlog({
 *   name: 'My Blog',
 *   description: 'Insights about web development and design.',
 *   url: 'https://danielheene.io/blog',
 *   image: 'https://danielheene.io/blog-og.jpg',
 *   keywords: ['web development', 'design', 'coding']
 * })
 * ```
 */
export function generateBlog(data: BlogData): WithContext<BlogLeaf> {
  const blog: WithContext<BlogLeaf> = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: data.name,
    url: data.url,
  }

  if (data.description) {
    blog.description = data.description
  }

  if (data.image) {
    blog.image = {
      '@type': 'ImageObject',
      url: data.image,
    }
  }

  if (data.keywords && data.keywords.length > 0) {
    blog.keywords = data.keywords.join(', ')
  }

  return blog
}
