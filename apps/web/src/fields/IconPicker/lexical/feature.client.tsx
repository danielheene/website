'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'

import { Icon } from '@repo/ui/Icon'

import { INSERT_ICON_COMMAND } from './nodes/commands'
import { IconNode } from './nodes/IconNode.client'
import { IconPickerPlugin } from './plugin/IconPickerPlugin'

const IconToolbarIcon = () => <Icon name="material-symbols:add-reaction-outline" />

/**
 * Client half of the icon feature: registers the node, the picker plugin and
 * the toolbar/slash-menu entries that open it.
 */
export const IconPickerFeatureClient = createClientFeature({
  nodes: [
    IconNode,
  ],
  plugins: [
    {
      Component: IconPickerPlugin,
      position: 'normal',
    },
  ],
  slashMenu: {
    groups: [
      {
        key: 'basic',
        items: [
          {
            Icon: IconToolbarIcon,
            key: 'icon',
            keywords: [
              'icon',
              'iconify',
              'emoji',
              'symbol',
            ],
            label: 'Icon',
            onSelect: ({ editor }) => {
              editor.dispatchCommand(INSERT_ICON_COMMAND, undefined)
            },
          },
        ],
      },
    ],
  },
  toolbarFixed: {
    groups: [
      {
        key: 'icon',
        type: 'buttons',
        items: [
          {
            ChildComponent: IconToolbarIcon,
            key: 'icon',
            label: 'Insert icon',
            onSelect: ({ editor }) => {
              editor.dispatchCommand(INSERT_ICON_COMMAND, undefined)
            },
          },
        ],
      },
    ],
  },
})

export default IconPickerFeatureClient
