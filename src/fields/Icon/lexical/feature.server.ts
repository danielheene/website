import { createServerFeature } from '@payloadcms/richtext-lexical'

import { ICON_NODE_TYPE, IconServerNode, type SerializedIconNode } from './nodes/IconNode.server'

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
    ClientFeature: '@/fields/Icon/lexical/feature.client#IconPickerFeatureClient',
    nodes: [
      {
        node: IconServerNode,
        converters: {
          html: {
            converter: ({ node }) => {
              const { iconName } = node as SerializedIconNode
              if (!iconName) return ''

              return `<span data-icon="${escapeHtmlAttribute(iconName)}"></span>`
            },
            nodeTypes: [
              ICON_NODE_TYPE,
            ],
          },
        },
      },
    ],
  },
})

/**
 * Icon names come from the Iconify API rather than free-form input, but this
 * value still lands in an HTML attribute — escape it so a malformed or crafted
 * name cannot break out of the quotes.
 */
const escapeHtmlAttribute = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
