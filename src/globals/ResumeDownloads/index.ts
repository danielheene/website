import type { GlobalConfig } from 'payload'

import { AdminGroup } from '@custom-types'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { revalidateResumeSectionGlobalHook } from '@/lib/hooks/revalidateResumeSection'
import { GlobalSlug } from '@/types/globals'

export const ResumeDownloads: GlobalConfig<GlobalSlug['ResumeDownloads']> = {
  slug: GlobalSlug['ResumeDownloads'],
  label: 'Downloads',
  access: {
    read: authenticatedOrPublished,
    readVersions: authenticated,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      revalidateResumeSectionGlobalHook(GlobalSlug['ResumeDownloads']),
    ],
  },
  admin: {
    group: AdminGroup.Resume,
  },
  typescript: {
    interface: 'ResumeDownloadsGlobalData',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Intro',
          fields: [],
        },
      ],
    },
  ],
  versions: false,
}
