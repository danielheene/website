import { createServerFeature } from '@payloadcms/richtext-lexical'

import { READ_MORE_NODE_TYPE, ReadMoreServerNode } from './ReadMoreNode.server'

/**
 * Lexical feature adding a WordPress-style "Read more" marker to the fixed
 * toolbar and the slash menu, for splitting a post into a leading excerpt
 * and the rest of the article — see `ReadMoreNode.base`'s doc comment for
 * how the split is used.
 *
 * Usage in an editor's feature list:
 *
 *     ReadMoreFeature()
 *
 * and render the node with the `readMore` converter in
 * `@/components/RichText` (returns null — invisible on the published page).
 */
export const ReadMoreFeature = createServerFeature({
  key: 'readMore',
  feature: {
    ClientFeature: '@/fields/RichText/lexical/readMore/feature.client#ReadMoreFeatureClient',
    nodes: [
      {
        node: ReadMoreServerNode,
        converters: {
          html: {
            converter: () => '',
            nodeTypes: [
              READ_MORE_NODE_TYPE,
            ],
          },
        },
      },
    ],
  },
})
