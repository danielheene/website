import type { Block } from 'payload'

import type { ResumeLayoutBlockProps } from '@/components/AdminPanel'
import { BlockGroup, BlockSlug } from '@/types/blocks'
import { GlobalSlug } from '@/types/globals'

const BlockComponent = {
  path: '@/components/AdminPanel#ResumeLayoutBlock',
  clientProps: {
    backgroundColor: 'primary',
    imageSrc: `/payload/blocks/${GlobalSlug.ResumeExperience}-thumbnail.svg`,
    editHref: `/admin/globals/${GlobalSlug.ResumeExperience}`,
  } as ResumeLayoutBlockProps,
}
export const ResumeExperienceBlock: Block = {
  slug: BlockSlug.ResumeExperience,
  interfaceName: BlockSlug.ResumeExperience,
  labels: {
    singular: 'Experience Section',
    plural: 'Experience Sections',
  },
  admin: {
    group: BlockGroup.Resume,
    disableBlockName: true,
    components: {
      Block: BlockComponent,
    },
    images: {
      icon: `/payload/blocks/${BlockSlug.ResumeExperience}-icon.svg`,
      thumbnail: `/payload/blocks/${BlockSlug.ResumeExperience}-thumbnail.svg`,
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
