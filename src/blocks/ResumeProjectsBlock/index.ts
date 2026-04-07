import { BlockGroup, BlockSlug, GlobalSlug } from '@custom-types'
import type { Block } from 'payload'

import type { ResumeLayoutBlockProps } from '@/components/AdminPanel'

const BlockComponent = {
  path: '@/components/AdminPanel#ResumeLayoutBlock',
  clientProps: {
    backgroundColor: 'white',
    imageSrc: '/payload/blocks/resume-projects.svg',
    editHref: `/admin/globals/${GlobalSlug.ResumeProjects}`,
  } satisfies ResumeLayoutBlockProps,
}

export const ResumeProjectsBlock: Block = {
  slug: BlockSlug.ResumeProjects,
  interfaceName: BlockSlug.ResumeProjects,
  labels: {
    singular: 'Project Section',
    plural: 'Project Sections',
  },
  imageURL: '/payload/blocks/resume-projects.svg',
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
