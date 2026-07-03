import type { Block } from 'payload'

import type { ResumeLayoutBlockProps } from '@/components/AdminPanel/ResumeLayoutBlock'
import { BlockGroup, BlockSlug } from '@/types/blocks'
import { GlobalSlug } from '@/types/globals'

const BlockComponent = {
  path: '@/components/AdminPanel#ResumeLayoutBlock',
  clientProps: {
    backgroundColor: 'white',
    imageSrc: '/payload/blocks/resume-about-me.svg',
    editHref: `/admin/globals/${GlobalSlug.ResumeAboutMe}`,
  } satisfies ResumeLayoutBlockProps,
}

export const ResumeAboutMeBlock: Block = {
  slug: BlockSlug.ResumeAboutMe,
  interfaceName: BlockSlug.ResumeAboutMe,
  labels: {
    singular: 'AboutMe Container',
    plural: 'AboutMe Sections',
  },
  admin: {
    group: BlockGroup.Resume,
    disableBlockName: true,
    components: {
      Block: BlockComponent,
    },
    images: {
      icon: `/payload/blocks/${BlockSlug.ResumeAboutMe}-icon.svg`,
      thumbnail: `/payload/blocks/${BlockSlug.ResumeAboutMe}-thumbnail.svg`,
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
