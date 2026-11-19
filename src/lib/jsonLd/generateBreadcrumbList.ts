import type { BreadcrumbListLeaf, ListItem } from 'schema-dts'

import { breadcrumbId } from './ids'

export interface BreadcrumbItem {
  name: string
  url: string
}

/**
 * The trail from the home page to `items`' last entry, which is the current
 * page; its `@id` is derived from that page's URL.
 */
export function generateBreadcrumbList(items: BreadcrumbItem[]): BreadcrumbListLeaf {
  const itemListElement: ListItem[] = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  }))

  return {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId(items.at(-1)?.url ?? ''),
    itemListElement,
  }
}
