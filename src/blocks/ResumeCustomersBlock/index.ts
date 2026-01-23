import { Block } from 'payload'
import { BlockGroup, BlockSlug, GlobalSlug } from '@custom-types'
import { ResumeLayoutBlockProps } from '@/components/AdminPanel'

const BlockComponent = {
  path: '@/components/AdminPanel#ResumeLayoutBlock',
  clientProps: {
    backgroundColor: 'primary',
    imageSrc: '/payload/blocks/resume-customers.svg',
    editHref: `/admin/globals/${GlobalSlug.ResumeCustomers}`,
  } satisfies ResumeLayoutBlockProps,
}

export const ResumeCustomersBlock: Block = {
  slug: BlockSlug.ResumeCustomers,
  interfaceName: BlockSlug.ResumeCustomers,
  labels: {
    singular: 'Customers Section',
    plural: 'Customers Sections',
  },
  imageURL: '/payload/blocks/resume-customers.svg',
  admin: {
    group: BlockGroup.Resume,
    disableBlockName: true,
    components: {
      Block: BlockComponent,
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

export { Renderer as ResumeCustomersBlockRenderer } from './Renderer'
