import { AdminGroup } from '@custom-types'
import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { RichTextField } from '@/fields/RichText'
import { TitleField } from '@/fields/Title'
import { revalidateResumeSectionGlobalHook } from '@/lib/hooks/revalidateResumeSection'
import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'

export const ResumeDownloads: GlobalConfig<GlobalSlug.ResumeDownloads> = {
  slug: GlobalSlug.ResumeDownloads,
  label: 'Downloads',
  access: {
    read: authenticatedOrPublished,
    readVersions: authenticated,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      revalidateResumeSectionGlobalHook(GlobalSlug.ResumeDownloads),
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
          fields: [
            TitleField(),
            {
              type: 'group',
              label: 'Documents',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'document_en',
                      type: 'upload',
                      label: 'English',
                      relationTo: CollectionSlug.MediaDocuments,
                      admin: {
                        width: '50%',
                        disableGroupBy: true,
                        disableListColumn: true,
                        disableListFilter: true,
                        readOnly: true,
                      },
                    },
                    {
                      name: 'document_de',
                      type: 'upload',
                      label: 'German',
                      relationTo: CollectionSlug.MediaDocuments,
                      admin: {
                        width: '50%',
                        disableGroupBy: true,
                        disableListColumn: true,
                        disableListFilter: true,
                        readOnly: true,
                      },
                    },
                  ],
                },
              ],
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
  versions: false,
}
