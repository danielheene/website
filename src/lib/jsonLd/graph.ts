import type { Graph, Thing } from 'schema-dts'

/** Wraps a page's nodes into one `@graph`, skipping the ones a page doesn't have. */
export const jsonLdGraph = (nodes: (Thing | null | undefined | false)[]): Graph => ({
  '@context': 'https://schema.org',
  '@graph': nodes.filter((node): node is Thing => Boolean(node)),
})
