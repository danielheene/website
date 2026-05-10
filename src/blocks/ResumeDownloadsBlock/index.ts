import type { Block } from 'payload'

import type { ResumeLayoutBlockProps } from '@/components/AdminPanel'
import { BlockGroup, BlockSlug } from '@/types/blocks'
import { GlobalSlug } from '@/types/globals'

const BlockComponent = {
  path: '@/components/AdminPanel#ResumeLayoutBlock',
  clientProps: {
    backgroundColor: 'primary',
    imageSrc: `/payload/blocks/${GlobalSlug.ResumeDownloads}-thumbnail.svg`,
    editHref: `/admin/globals/${GlobalSlug.ResumeDownloads}`,
  } as ResumeLayoutBlockProps,
}

export const ResumeDownloadsBlock: Block = {
  slug: BlockSlug.ResumeDownloads,
  interfaceName: BlockSlug.ResumeDownloads,
  labels: {
    singular: 'Downloads Section',
    plural: 'Downloads Sections',
  },
  admin: {
    group: BlockGroup.Resume,
    disableBlockName: true,
    components: {
      Block: BlockComponent,
    },
    images: {
      icon: `/payload/blocks/${BlockSlug.ResumeDownloads}-icon.svg`,
      thumbnail: `/payload/blocks/${BlockSlug.ResumeDownloads}-thumbnail.svg`,
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
