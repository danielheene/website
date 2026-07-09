import type { ArrayField, GlobalConfig } from 'payload'

import { AdminGroup } from '@custom-types'

import { authenticated } from '@/access/authenticated'
import { LinkField } from '@/fields/Link'
import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'
import { TemplateField } from '@/fields/Template'
import { updateGlobalData } from '@/lib/fetchers/fetchGlobalData'
import { extractErrorMessage } from '@/lib/extractErrorMessage'

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
  fields: [
    LinkField(),
  ],
})

export const SiteSettings: GlobalConfig = {
  slug: GlobalSlug['SiteSettings'],
  label: 'Site Settings',
  access: {
    read: authenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      async ({ doc, context, global }) => {
        if (context.skipRevalidate) return doc
        updateGlobalData(GlobalSlug['SiteSettings']).catch(error => console.error(extractErrorMessage(error)))
      },
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
                  name: 'siteName',
                  label: 'Site Name',
                  defaultValue: process.env.SERVER_HOST,
                  type: 'text',
                },
                TemplateField({
                  name: 'titleTemplate',
                  label: 'Title Template',
                  description: 'This template is used for generating the title tag value on each page. ' +
                    'Title refers to the actual document title which is suffixed with siteName.',
                  renderLocale: ['en'],
                  data: ({siblingData}) => ({
                    ...Object.fromEntries(Object.entries(siblingData).map(([key, value]) => [key, `${value}`]))
                  }),
                  anntotation: ({ siblingData }) =>                  {
                    return {
                      label: 'Sibling Data',
                      entries: Object.fromEntries(Object.entries(siblingData).map(([key, value]) => [key, String(value)]))
                    }
                  }  ,
                  defaultValue: '{{title}} | {{siteName}}',
                }),
                {
                  name: 'siteUrl',
                  label: 'Site URL',
                  type: 'text',
                  defaultValue: process.env.SERVER_HOST,
                  admin: {
                    description: 'This URL is used for generating website metadata.',
                    readOnly: true,
                  },
                },
                {
                  name: 'category',
                  type: 'text',
                  defaultValue: 'website',
                  admin: {
                    description: 'This category is used for generating website metadata.',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  admin: {
                    description:
                      'This description is used for generating website metadata.' +
                      'This description is also used as fallback if no document description is available.',
                  },
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: [
                    CollectionSlug['MediaImages'],
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
                  relationTo: [
                    CollectionSlug['MediaVideos'],
                    CollectionSlug['MediaImages'],
                  ],
                },
                {
                  name: 'searchUrl',
                  type: 'text',
                  admin: {
                    description: 'This URL is used for generating website metadata.',
                  },
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
