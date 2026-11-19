import type { ItemListLeaf, ListItem, Thing } from 'schema-dts'

/** An ordered list of things, e.g. the posts on a listing page. */
export function generateItemList(id: string, items: Thing[]): ItemListLeaf {
  const itemListElement: ListItem[] = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item,
  }))

  return {
    '@type': 'ItemList',
    '@id': id,
    numberOfItems: items.length,
    itemListElement,
  }
}
