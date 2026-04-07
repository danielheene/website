import { BlockGroup, BlockSlug } from '@custom-types'
import type { Block } from 'payload'

export const CodeBlock: Block = {
  slug: BlockSlug.Code,
  interfaceName: BlockSlug.Code,
  labels: {
    singular: 'Code Block',
    plural: 'Code Block',
  },
  imageURL: '/payload/blocks/general-code.svg',
  admin: {
    group: BlockGroup.General,
    disableBlockName: true,
  },
  fields: [
    {
      name: 'language',
      type: 'select',
      defaultValue: 'typescript',
      options: [
        {
          label: 'Typescript',
          value: 'typescript',
        },
        {
          label: 'Javascript',
          value: 'javascript',
        },
        {
          label: 'CSS',
          value: 'css',
        },
      ],
    },
    {
      name: 'code',
      type: 'code',
      label: false,
      required: true,
      admin: {
        editorOptions: {
          fontSize: 16,
          padding: { top: 12, bottom: 12 },
        },
        language: 'typescript',
        editorProps: {},
      },
    },
  ],
}
