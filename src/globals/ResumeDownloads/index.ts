import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { RichTextField } from '@/fields/RichText'
import { TitleField } from '@/fields/Title'
import { revalidateResumeSection } from '@/utilities/revalidateResumeSection'
import { AdminGroup, CollectionSlug, GlobalSlug } from '@custom-types'
import { GlobalConfig } from 'payload'

export const ResumeDownloads: GlobalConfig<GlobalSlug.ResumeDownloads> = {
  slug: GlobalSlug.ResumeDownloads,
  label: 'Downloads',
  access: {
    read: authenticatedOrPublished,
    readVersions: authenticated,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateResumeSection(GlobalSlug.ResumeDownloads)],
  },
  admin: {
    group: AdminGroup.Resume,
  },
  typescript: { interface: 'ResumeDownloadsGlobalData' },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Intro',
          fields: [
            TitleField(),
            {
              name: 'documentPreview',
              type: 'upload',
              label: 'Document Preview',
              relationTo: CollectionSlug.MediaImages,
              filterOptions: {
                mimeType: { contains: 'image' },
              },
            },
            RichTextField({
              name: 'caption',
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
