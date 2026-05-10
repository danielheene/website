import { AdminGroup } from '@custom-types'
import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { RichTextField } from '@/fields/RichText'
import { TitleField } from '@/fields/Title'
import { enqueueGenerateResumeDocuments } from '@/lib/hooks/enqueueGenerateResumeDocuments'
import { revalidateResumeSection } from '@/lib/hooks/revalidateResumeSection'
import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'

export const ResumeAboutMe: GlobalConfig<GlobalSlug.ResumeAboutMe> = {
  slug: GlobalSlug.ResumeAboutMe,
  label: 'About Me',
  access: {
    read: authenticatedOrPublished,
    readVersions: authenticated,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      revalidateResumeSection(GlobalSlug.ResumeAboutMe),
      enqueueGenerateResumeDocuments,
    ],
  },
  admin: {
    group: AdminGroup.Resume,
  },
  typescript: {
    interface: 'ResumeAboutMeGlobalData',
  },
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
  versions: false,
}
