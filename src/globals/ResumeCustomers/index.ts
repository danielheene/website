import { AdminGroup, GlobalSlug } from '@custom-types'
import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { CustomerLogosField } from '@/fields/CustomerLogos'
import { RichTextField } from '@/fields/RichText'
import { TitleField } from '@/fields/Title'
import { revalidateResumeSection } from '@/utilities/revalidateResumeSection'

export const ResumeCustomers: GlobalConfig<GlobalSlug.ResumeCustomers> = {
  slug: GlobalSlug.ResumeCustomers,
  label: 'Customers',
  access: {
    read: authenticatedOrPublished,
    readVersions: authenticated,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateResumeSection(GlobalSlug.ResumeCustomers)],
  },
  admin: {
    group: AdminGroup.Resume,
  },
  typescript: { interface: 'ResumeCustomersGlobalData' },
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
          label: 'Customer Logos',
          fields: [CustomerLogosField()],
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
