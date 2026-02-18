import { BlockGroup, BlockSlug, GlobalSlug } from '@custom-types'
import type { Block } from 'payload'

import type { ResumeLayoutBlockProps } from '@/components/AdminPanel'

const BlockComponent = {
  path: '@/components/AdminPanel#ResumeLayoutBlock',
  clientProps: {
    backgroundColor: 'primary',
    imageSrc: '/payload/blocks/resume-experience.svg',
    editHref: `/admin/globals/${GlobalSlug.ResumeExperience}`,
  } satisfies ResumeLayoutBlockProps,
}
export const ResumeExperienceBlock: Block = {
  slug: BlockSlug.ResumeExperience,
  interfaceName: BlockSlug.ResumeExperience,
  labels: {
    singular: 'Experience Section',
    plural: 'Experience Sections',
  },
  imageURL: '/payload/blocks/resume-experience.svg',
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

export { Renderer as ResumeExperienceBlockRenderer } from './Renderer'
