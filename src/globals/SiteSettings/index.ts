import type { ArrayField, GlobalConfig } from 'payload'

import { jsonSchema } from 'ai'

import { authenticated } from '@/access/authenticated'
import { LinkField } from '@/fields/Link'
import { TemplateField } from '@/fields/Template'
import { generateResumeDocumentHook } from '@/lib/hooks/global'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'

import { revalidateDocument } from './hooks/revalidateDocument'

const NavEntries = (): ArrayField => ({
  type: 'array',
  name: 'entries',
  labels: {
    singular: 'Navigation Entry',
    plural: 'Navigation Entries',
  },
  admin: {
    components: {
      Label: false,
    },
  },
  hooks: {
    afterRead: [
      async ({ value = [] }) => value,
    ],
  },
  interfaceName: 'NavEntries',
  fields: [
    ...LinkField().fields,
  ],
})

export const SiteSettings: GlobalConfig = {
  slug: GlobalSlug.SiteSettings,
  label: 'Site Settings',
  access: {
    read: authenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      revalidateDocument,
      generateResumeDocumentHook,
    ],
  },
  admin: {
    group: AdminGroup.Settings,
  },
  typescript: {
    interface: 'SiteSettings',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        /**
         * General Settings
         */
        {
          label: 'General',
          fields: [
            {
              type: 'group',
              name: 'general',
              interfaceName: 'GeneralSettings',
              required: true,
              defaultValue: {
                siteName: process.env.SERVER_HOST,
                titleTemplate: '{{title}} | {{siteName}}',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'siteName',
                      label: 'Site Name',
                      defaultValue: process.env.SERVER_HOST,
                      type: 'text',
                      admin: {
                        width: '50%',
                        description: 'The name of the site.',
                      },
                    },
                    {
                      name: 'category',
                      type: 'text',
                      defaultValue: 'website',
                      admin: {
                        width: '50%',
                        description: 'This category is used for generating website metadata.',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'siteHost',
                      label: 'Site Host',
                      type: 'text',
                      virtual: true,
                      defaultValue: process.env.SERVER_HOST,
                      admin: {
                        readOnly: true,
                        width: '50%',
                        description: 'The host of the site.',
                      },
                    },
                    {
                      name: 'siteURL',
                      label: 'Site URL',
                      type: 'text',
                      virtual: true,
                      defaultValue: process.env.SERVER_URL,
                      admin: {
                        readOnly: true,
                        width: '50%',
                        description: 'The URL of the site.',
                      },
                    },
                  ],
                },

                TemplateField({
                  name: 'titleTemplate',
                  label: 'Title Template',
                  description:
                    'This template is used for generating the title tag value on each page. ' +
                    'Title refers to the actual document title which is suffixed with siteName.',
                  renderLocale: [
                    'en',
                  ],
                  data: {
                    title: 'Lorem ipsum dolor sit amet',
                  },
                  defaultValue: '{{title}} | {{siteName}}',
                }),

                {
                  name: 'description',
                  type: 'textarea',
                  admin: {
                    description:
                      'This description is used for generating website metadata.  ' +
                      'This description is also used as fallback if no document description is available.',
                  },
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: [
                    CollectionSlug.MediaImages,
                  ],
                  filterOptions: {
                    mimeType: {
                      contains: 'image',
                    },
                  },
                },
                {
                  name: 'errorHero',
                  type: 'upload',
                  hasMany: true,
                  minRows: 1,
                  maxRows: 1,
                  relationTo: [
                    CollectionSlug.MediaVideos,
                    CollectionSlug.MediaImages,
                  ],
                },
              ],
            },
          ],
        },

        /**
         * Header Settings
         */
        {
          name: 'header',
          label: 'Header',
          interfaceName: 'HeaderSettings',
          fields: [
            {
              type: 'tabs',
              admin: {
                className: 'tabs-field--vertical',
              },
              tabs: [
                {
                  name: 'mainNavigation',
                  label: 'Main Navigation',
                  fields: [
                    NavEntries(),
                  ],
                },
              ],
            },
          ],
        },

        /**
         * Footer Settings
         */
        {
          name: 'footer',
          label: 'Footer',
          interfaceName: 'FooterSettings',
          fields: [
            {
              type: 'tabs',
              admin: {
                className: 'tabs-field--vertical',
              },
              tabs: [
                {
                  name: 'column1',
                  label: 'Column #1',
                  fields: [
                    {
                      type: 'checkbox',
                      name: 'isActive',
                      defaultValue: false,
                      label: 'Is Active',
                    },
                    {
                      type: 'text',
                      name: 'title',
                    },
                    NavEntries(),
                  ],
                },
                {
                  name: 'column2',
                  label: 'Column #2',
                  fields: [
                    {
                      type: 'checkbox',
                      name: 'isActive',
                      defaultValue: false,
                      label: 'Is Active',
                    },
                    {
                      type: 'text',
                      name: 'title',
                    },
                    NavEntries(),
                  ],
                },
                {
                  name: 'column3',
                  label: 'Column #3',
                  fields: [
                    {
                      type: 'checkbox',
                      name: 'isActive',
                      defaultValue: false,
                      label: 'Is Active',
                    },
                    {
                      type: 'text',
                      name: 'title',
                    },
                    NavEntries(),
                  ],
                },
                {
                  name: 'legalPages',
                  label: 'Legal Pages',
                  fields: [
                    NavEntries(),
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  versions: false,
}
