import { AdminGroup } from '@custom-types'
import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { RichTextField } from '@/fields/RichText'
import { TitleField } from '@/fields/Title'
import { revalidateResumeSection } from '@/lib/hooks/revalidateResumeSection'
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
      revalidateResumeSection(GlobalSlug.ResumeDownloads),
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
              name: 'documents',
              label: 'Documents',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'en',
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
                      name: 'de',
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

            {
              name: 'documentPreview',
              type: 'upload',
              label: 'Document Preview',
              relationTo: CollectionSlug.MediaImages,
              filterOptions: {
                mimeType: {
                  contains: 'image',
                },
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
  versions: false,
}
