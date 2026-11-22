import type { ArrayField, GlobalConfig } from 'payload'

import { HeroSlidesField } from '@/fields/HeroSlides'
import { LinkField } from '@/fields/Link'
import { SectionGroupField } from '@/fields/SectionGroup'
import { TemplateField } from '@/fields/Template'
import { authenticated } from '@/lib/access/authenticated'
import { generateResumeDocumentHook } from '@/lib/payloadHooks/global'
import { AdminGroup } from '@/types/admin-panel'
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
    afterRead: [({ value = [] }) => value],
  },
  interfaceName: 'NavEntries',
  fields: [...LinkField().fields],
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
    afterChange: [revalidateDocument, generateResumeDocumentHook],
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
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'siteName',
                      label: 'Site Name',
                      type: 'text',
                      hooks: {
                        afterRead: [({ value }) => value || process.env.SERVER_HOST],
                      },
                      admin: {
                        width: '50%',
                        description: 'The name of the site.',
                      },
                    },
                    {
                      name: 'category',
                      type: 'text',
                      hooks: {
                        afterRead: [({ value }) => value || 'website'],
                      },
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
                      hooks: {
                        afterRead: [() => process.env.SERVER_HOST],
                      },
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
                      hooks: {
                        afterRead: [() => process.env.SERVER_URL],
                      },
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
                  renderLocale: ['en'],
                  data: {
                    title:
                      'This is an extra long example title template that is used for generating the title tag value on each page.',
                  },
                  defaultValue: '{title | trunc50 } | {siteName}',
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
                      label: 'Fallback Open Graph Background',
                      description: `
                        Background of a page's Open Graph image when its hero has no image. The
                        title, description and logo are still drawn on top, so this is not used
                        as a complete Open Graph image. Left empty, the cards fall back to
                        public/og-background-fallback.webp; a card that fails to render is
                        replaced by public/og-image-fallback.webp
                      `,
                      hideGutter: true,
                      overrides: {
                        admin: {
                          width: '50%',
                        },
                      },
                      fields: [
                        HeroSlidesField({
                          name: 'fallbackOgBackground',
                          position: undefined,
                          editorVariant: 'single',
                        }),
                      ],
                    }),
                    SectionGroupField({
                      label: 'Error Page Hero',
                      description: `
                        The selected item is used to render the error page hero. Left empty, the
                        error page falls back to public/not-found-fallback.webp
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
                  fields: [NavEntries()],
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
                  fields: [NavEntries()],
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
