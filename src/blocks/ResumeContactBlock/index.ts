import type { Block } from 'payload'

import type { ResumeLayoutBlockProps } from '@/components/AdminPanel'
import { BlockGroup, BlockSlug } from '@/types/blocks'
import { GlobalSlug } from '@/types/globals'

const BlockComponent = {
  path: '@/components/AdminPanel#ResumeLayoutBlock',
  clientProps: {
    backgroundColor: 'white',
    imageSrc: `/payload/blocks/${GlobalSlug.ResumeContact}-thumbnail.svg`,
    editHref: `/admin/globals/${GlobalSlug.ResumeContact}`,
  } as ResumeLayoutBlockProps,
}

export const ResumeContactBlock: Block = {
  slug: BlockSlug.ResumeContact,
  interfaceName: BlockSlug.ResumeContact,
  labels: {
    singular: 'Contact Container',
    plural: 'Contact Sections',
  },
  admin: {
    group: BlockGroup.Resume,
    disableBlockName: true,
    components: {
      Block: BlockComponent,
    },
    images: {
      icon: `/payload/blocks/${BlockSlug.ResumeContact}-icon.svg`,
      thumbnail: `/payload/blocks/${BlockSlug.ResumeContact}-thumbnail.svg`,
    },
  },
  fields: [
    {
      type: 'json',
      name: 'data',
      virtual: true,
      defaultValue: {},
      admin: {
        components: {
          Field: BlockComponent,
        },
      },
    },
  ],
}
