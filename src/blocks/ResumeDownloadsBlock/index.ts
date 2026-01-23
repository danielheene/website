import { ResumeLayoutBlockProps } from '@/components/AdminPanel'
import { BlockGroup, BlockSlug, GlobalSlug } from '@custom-types'
import { Block } from 'payload'

const BlockComponent = {
  path: '@/components/AdminPanel#ResumeLayoutBlock',
  clientProps: {
    backgroundColor: 'primary',
    imageSrc: '/payload/blocks/resume-downloads.svg',
    editHref: `/admin/globals/${GlobalSlug.ResumeDownloads}`,
  } satisfies ResumeLayoutBlockProps,
}

export const ResumeDownloadsBlock: Block = {
  slug: BlockSlug.ResumeDownloads,
  interfaceName: BlockSlug.ResumeDownloads,
  labels: {
    singular: 'Downloads Section',
    plural: 'Downloads Sections',
  },
  imageURL: '/payload/blocks/resume-downloads.svg',
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

export { Renderer as ResumeDownloadsBlockRenderer } from './Renderer'
