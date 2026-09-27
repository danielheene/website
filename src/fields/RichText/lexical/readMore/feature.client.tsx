'use client'

import {
  createClientFeature,
  slashMenuBasicGroupWithItems,
  toolbarAddDropdownGroupWithItems,
} from '@payloadcms/richtext-lexical/client'

import { Icon } from '@/components/Icon'

import { INSERT_READ_MORE_COMMAND } from './commands'
import { ReadMorePlugin } from './plugin/ReadMorePlugin'
import { ReadMoreNode } from './ReadMoreNode.client'

const ReadMoreToolbarIcon = () => <Icon name="material-symbols:content-cut-rounded" />

/**
 * Client half of the read-more feature: registers the node, the insert
 * plugin, and the toolbar/slash-menu entries. Grouped into the toolbar's
 * "add" dropdown alongside HorizontalRuleFeature — both insert a full-width
 * marker at the cursor.
 */
export const ReadMoreFeatureClient = createClientFeature({
  nodes: [
    ReadMoreNode,
  ],
  plugins: [
    {
      Component: ReadMorePlugin,
      position: 'normal',
    },
  ],
  slashMenu: {
    groups: [
      slashMenuBasicGroupWithItems([
        {
          Icon: ReadMoreToolbarIcon,
          key: 'readMore',
          keywords: [
            'more',
            'read more',
            'excerpt',
            'teaser',
            'cut',
          ],
          label: 'Read More',
          onSelect: ({ editor }) => {
            editor.dispatchCommand(INSERT_READ_MORE_COMMAND, undefined)
          },
        },
      ]),
    ],
  },
  toolbarFixed: {
    groups: [
      toolbarAddDropdownGroupWithItems([
        {
          ChildComponent: ReadMoreToolbarIcon,
          key: 'readMore',
          label: 'Read More',
          onSelect: ({ editor }) => {
            editor.dispatchCommand(INSERT_READ_MORE_COMMAND, undefined)
          },
        },
      ]),
    ],
  },
})

export default ReadMoreFeatureClient
