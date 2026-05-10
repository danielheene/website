import type { Block } from 'payload'

import type { ResumeLayoutBlockProps } from '@/components/AdminPanel'
import { BlockGroup, BlockSlug } from '@/types/blocks'
import { GlobalSlug } from '@/types/globals'

const BlockComponent = {
  path: '@/components/AdminPanel#ResumeLayoutBlock',
  clientProps: {
    backgroundColor: 'primary',
    imageSrc: `/payload/blocks/${GlobalSlug.ResumeCustomers}-thumbnail.svg`,
    editHref: `/admin/globals/${GlobalSlug.ResumeCustomers}`,
  } as ResumeLayoutBlockProps,
}

export const ResumeCustomersBlock: Block = {
  slug: BlockSlug.ResumeCustomers,
  interfaceName: BlockSlug.ResumeCustomers,
  labels: {
    singular: 'Customers Section',
    plural: 'Customers Sections',
  },
  admin: {
    group: BlockGroup.Resume,
    disableBlockName: true,
    components: {
      Block: BlockComponent,
    },
    images: {
      icon: `/payload/blocks/${BlockSlug.ResumeCustomers}-icon.svg`,
      thumbnail: `/payload/blocks/${BlockSlug.ResumeCustomers}-thumbnail.svg`,
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
