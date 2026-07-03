import { AdminGroup } from '@custom-types'
import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { RichTextField } from '@/fields/RichText'
import { TitleField } from '@/fields/Title'
import { revalidateResumeSectionGlobalHook } from '@/lib/hooks/revalidateResumeSection'
import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'

export const ResumeProjects: GlobalConfig<GlobalSlug.ResumeProjects> = {
  slug: GlobalSlug.ResumeProjects,
  label: 'Projects',
  access: {
    read: authenticatedOrPublished,
    readVersions: authenticated,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      revalidateResumeSectionGlobalHook(GlobalSlug.ResumeProjects),
    ],
  },
  admin: {
    group: AdminGroup.Resume,
  },
  typescript: {
    interface: 'ResumeProjectsGlobalData',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Intro',
          fields: [
            TitleField(),
            RichTextField({
              name: 'caption',
              editorVariant: 'inline',
            }),
          ],
        },
        {
          label: 'Project List',
          fields: [
            {
              name: 'projectList',
              type: 'array',
              interfaceName: 'ProjectList',
              admin: {
                isSortable: true,
                initCollapsed: false,
                components: {
                  Label: false,
                  RowLabel: '@/fields/ProjectList/RowLabel',
                },
              },
              fields: [
                {
                  name: 'preHeading',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'heading',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: CollectionSlug.MediaImages,
                  filterOptions: {
                    mimeType: {
                      contains: 'image',
                    },
                  },
                },
                RichTextField({
                  name: 'content',
                  editorVariant: 'caption',
                }),
              ],
            },
          ],
        },
      ],
    },
  ],
  versions: false,
}
