import type { ArrayField, GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { HeroSlidesField } from '@/fields/HeroSlides'
import { LinkField } from '@/fields/Link'
import { SectionGroupField } from '@/fields/SectionGroup'
import { TemplateField } from '@/fields/Template'
import { generateResumeDocumentHook } from '@/lib/hooks/global'
import { AdminGroup } from '@/types/admin-panel'
import { GlobalData, GlobalSlug } from '@/types/globals'

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

export const SiteSettingsDefaults: Pick<GlobalData<GlobalSlug['SiteSettings']>, 'general'> = {
  general: {
    siteName: process.env.SERVER_HOST,
    category: 'website',
    siteHost: process.env.SERVER_HOST,
    siteURL: process.env.SERVER_URL,
    titleTemplate: '{{title}} | {{siteName}}',
  },
}

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
                ...SiteSettingsDefaults.general,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'siteName',
                      label: 'Site Name',
                      defaultValue: SiteSettingsDefaults.general.siteName,
                      type: 'text',
                      admin: {
                        width: '50%',
                        description: 'The name of the site.',
                      },
                    },
                    {
                      name: 'category',
                      type: 'text',
                      defaultValue: SiteSettingsDefaults.general.category,
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
                      defaultValue: SiteSettingsDefaults.general.siteHost,
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
                      defaultValue: SiteSettingsDefaults.general.siteURL,
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
                  defaultValue: SiteSettingsDefaults.general.titleTemplate,
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
                  type: 'row',
                  admin: {
                    className: 'py-8',
                  },
                  fields: [
                    SectionGroupField({
                      label: 'Default Opengraph Image',
                      description: `
                        This image is used as fallback if no document image is available
                      `,
                      hideGutter: true,
                      overrides: {
                        admin: {
                          width: '50%',
                        },
                      },
                      fields: [
                        HeroSlidesField({
                          name: 'defaultOpengraphImage',
                          position: undefined,
                          editorVariant: 'single',
                        }),
                      ],
                    }),
                    SectionGroupField({
                      label: 'Error Page Hero',
                      description: `
                        The selected item is used to render the error page hero
                      `,
                      hideGutter: true,
                      overrides: {
                        admin: {
                          width: '50%',
                        },
                      },
                      fields: [
                        HeroSlidesField({
                          name: 'errorHero',
                          position: undefined,
                          editorVariant: 'single',
                        }),
                      ],
                    }),
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
