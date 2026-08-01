import { createServerFeature } from '@payloadcms/richtext-lexical'

import { IconServerNode } from './nodes/IconNode.server'

/**
 * Lexical feature adding an Iconify icon picker to the fixed toolbar and the
 * slash menu. Icons are stored as an inline `icon` node holding the Iconify
 * name (`prefix:name`).
 *
 * Usage in an editor's feature list:
 *
 *     IconPickerFeature()
 *
 * and render the node with the `icon` converter in `@/components/RichText`.
 */
export const IconPickerFeature = createServerFeature({
  key: 'iconPicker',
  feature: {
    ClientFeature: '@/fields/IconPicker/lexical/feature.client#IconPickerFeatureClient',
    nodes: [
      {
        node: IconServerNode,
        converters: {
          html: {
            converter: ({ node }) =>
              `<span data-icon="${
                (
                  node as unknown as {
                    iconName?: string
                  }
                )?.iconName ?? ''
              }"></span>`,
            nodeTypes: [
              IconServerNode.getType(),
            ],
          },
        },
      },
    ],
  },
})
