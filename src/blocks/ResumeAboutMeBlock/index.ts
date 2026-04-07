import { BlockGroup, BlockSlug, GlobalSlug } from '@custom-types'
import type { Block } from 'payload'

import type { ResumeLayoutBlockProps } from '@/components/AdminPanel/ResumeLayoutBlock'

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
    singular: 'AboutMe Section',
    plural: 'AboutMe Sections',
  },
  imageURL: '/payload/blocks/resume-about-me.svg',
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
