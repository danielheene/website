import { AdminGroup } from '@custom-types'
import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { RichTextField } from '@/fields/RichText'
import { TitleField } from '@/fields/Title'
import { revalidateResumeSection } from '@/lib/hooks/revalidateResumeSection'
import { GlobalSlug } from '@/types/globals'

export const ResumeContact: GlobalConfig<GlobalSlug.ResumeContact> = {
  slug: GlobalSlug.ResumeContact,
  label: 'Contact',
  access: {
    read: authenticatedOrPublished,
    readVersions: authenticated,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      revalidateResumeSection(GlobalSlug.ResumeContact),
    ],
  },
  admin: {
    group: AdminGroup.Resume,
  },
  typescript: {
    interface: 'ResumeContactGlobalData',
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
              editorVariant: 'caption',
            }),
          ],
        },
      ],
    },
  ],
  versions: false,
}
