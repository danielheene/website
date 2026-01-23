import { Block } from 'payload'
import { BlockGroup, BlockSlug, GlobalSlug } from '@custom-types'
import { ResumeLayoutBlockProps } from '@/components/AdminPanel'

const BlockComponent = {
  path: '@/components/AdminPanel#ResumeLayoutBlock',
  clientProps: {
    backgroundColor: 'white',
    imageSrc: '/payload/blocks/resume-contact.svg',
    editHref: `/admin/globals/${GlobalSlug.ResumeContact}`,
  } satisfies ResumeLayoutBlockProps,
}

export const ResumeContactBlock: Block = {
  slug: BlockSlug.ResumeContact,
  interfaceName: BlockSlug.ResumeContact,
  labels: {
    singular: 'Contact Section',
    plural: 'Contact Sections',
  },
  imageURL: '/payload/blocks/resume-contact.svg',
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

export { Renderer as ResumeContactBlockRenderer } from './Renderer'
