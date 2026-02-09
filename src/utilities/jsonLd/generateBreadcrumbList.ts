import type { BreadcrumbList, ListItem, WithContext } from 'schema-dts'

export interface BreadcrumbItem {
  name: string
  url?: string
}

/**
 * Generates BreadcrumbList JSON-LD
 *
 * @example
 * ```typescript
 * const breadcrumbsLd = generateBreadcrumbList([
 *   { name: 'Home', url: 'https://danielheene.io' },
 *   { name: 'Blog', url: 'https://danielheene.io/blog' },
 *   { name: 'My Post' }
 * ])
 * ```
 */
export function generateBreadcrumbList(items: BreadcrumbItem[]): WithContext<BreadcrumbList> {
  const listItems: ListItem[] = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    ...(item.url && { item: item.url }),
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: listItems,
  }
}
