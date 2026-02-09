import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { RichTextField } from '@/fields/RichText'
import { TitleField } from '@/fields/Title'
import { revalidateResumeSection } from '@/utilities/revalidateResumeSection'
import { AdminGroup, CollectionSlug, GlobalSlug } from '@custom-types'
import { GlobalConfig } from 'payload'

export const ResumeProjects: GlobalConfig<GlobalSlug.ResumeProjects> = {
  slug: GlobalSlug.ResumeProjects,
  label: 'Projects',
  access: {
    read: authenticatedOrPublished,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateResumeSection(GlobalSlug.ResumeProjects)],
  },
  admin: {
    group: AdminGroup.Resume,
  },
  typescript: { interface: 'ResumeProjectsGlobalData' },
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
                    mimeType: { contains: 'image' },
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
  versions: {
    drafts: {
      autosave: false,
      schedulePublish: false,
    },
  },
}
