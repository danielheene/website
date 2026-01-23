import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { RichTextField } from '@/fields/RichText'
import { TitleField } from '@/fields/Title'
import { revalidateResumeSection } from '@/payload/hooks/revalidateResumeSection'
import { AdminGroup, GlobalSlug } from '@custom-types'
import { GlobalConfig } from 'payload'

export const ResumeAboutMe: GlobalConfig<GlobalSlug.ResumeAboutMe> = {
  slug: GlobalSlug.ResumeAboutMe,
  label: 'About Me',
  access: {
    read: authenticatedOrPublished,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateResumeSection(GlobalSlug.ResumeAboutMe)],
  },
  admin: {
    group: AdminGroup.Resume,
  },
  typescript: { interface: 'ResumeAboutMeGlobalData' },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Intro',
          fields: [
            TitleField(),
            {
              name: 'portrait',
              type: 'upload',
              label: 'Portrait',
              relationTo: 'media',
              filterOptions: {
                mimeType: { contains: 'image' },
              },
            },
            RichTextField({
              name: 'content',
              editorVariant: 'inline',
            }),
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
