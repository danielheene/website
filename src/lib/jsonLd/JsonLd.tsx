import type { Graph, Thing } from 'schema-dts'

import { jsonLdGraph } from './graph'

export interface JsonLdProps {
  /** The page's nodes, rendered as one `@graph`. */
  nodes: (Thing | null | undefined | false)[]
}

/**
 * Renders structured data as one JSON-LD `@graph`. `JSON.stringify` doesn't
 * escape `</script>`, so `</` becomes `<\/`, which is still valid JSON.
 */
export function JsonLd({ nodes }: JsonLdProps) {
  const graph: Graph = jsonLdGraph(nodes)

  if (graph['@graph'].length === 0) return null

  return (
    <script
      type="application/ld+json"
      // oxlint-disable-next-line react/no-danger -- / is escaped as <\/ to prevent </script> injection
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/<\//g, '<\\/'), // nosemgrep: react-dangerouslysetinnerhtml -- reviewed, see the oxlint-disable reason above
      }}
    />
  )
}
