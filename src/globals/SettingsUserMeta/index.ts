import { AdminGroup, CollectionSlug, GlobalSlug } from '@custom-types'
import dedent from 'dedent'
import ISO6391 from 'iso-639-1'
import { revalidateTag } from 'next/cache'
import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { AddressField } from '@/fields/Address'
import { IconField } from '@/fields/Icon'
import { getProficiencyLabel, PROFICIENCY_LEVEL } from '@/lib/languageProficiency'

export const SettingsUserMeta: GlobalConfig = {
  slug: GlobalSlug.SettingsUserMeta,
  label: 'User Meta',
  access: {
    read: authenticatedOrPublished,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      async ({ doc, context }) => {
        if (context.skipRevalidate) return doc
        revalidateTag(GlobalSlug.SettingsUserMeta)
      },
    ],
  },
  admin: {
    group: AdminGroup.Settings,
    components: {
      elements: {
        beforeDocumentControls: ['@/components/AdminPanel#LanguageToggle'],
      },
    },
  },
  typescript: { interface: 'UserMetaData' },
  fields: [
    {
      type: 'group',
      label: 'Personal Information',
      admin: {
        description: dedent`
            This section describes personal information about you.
        `,
        components: {
          Description: '@/components/AdminPanel#DescriptionWithNewline',
        },
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: CollectionSlug.MediaImages,
        },
        {
          name: 'url',
          type: 'text',
          defaultValue: process.env.NEXT_PUBLIC_SERVER_URL,
          admin: {
            hidden: true,
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
            },
            {
              name: 'jobTitle',
              type: 'text',
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'gender',
              type: 'text',
              admin: {
                width: '50%',
              },
            },
            {
              name: 'homeLocation',
              type: 'text',
              admin: {
                width: '50%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'birthPlace',
              type: 'text',
              admin: {
                width: '50%',
              },
            },
            {
              name: 'birthDate',
              type: 'date',
              admin: {
                width: '50%',
                date: {
                  displayFormat: 'yyyy-MM-dd',
                },
              },
            },
          ],
        },
      ],
    },
    {
      name: 'languages',
      label: 'Languages',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'language',
              type: 'select',
              options: ISO6391.getAllCodes().map((code) => ({
                value: code,
                label: {
                  de: `${new Intl.DisplayNames(['de'], { type: 'language' }).of(code)}`,
                  en: `${new Intl.DisplayNames(['en'], { type: 'language' }).of(code)}`,
                },
              })),
            },
            {
              name: 'proficiency',
              type: 'select',
              options: Object.values(PROFICIENCY_LEVEL).map((level) => ({
                value: level,
                label: {
                  de: `${level}: ${getProficiencyLabel(level, 'de')}`,
                  en: `${level}: ${getProficiencyLabel(level, 'en')}`,
                },
              })),
            },
          ],
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'taxID',
          label: 'Tax ID',
          type: 'text',
          admin: {
            width: '33.3%',
          },
        },
        {
          name: 'vatID',
          label: 'VAT ID',
          type: 'text',
          admin: {
            width: '33.3%',
          },
        },
        {
          name: 'duns',
          label: 'DUNS',
          type: 'text',
          admin: {
            width: '33.3%',
          },
        },
      ],
    },

    {
      type: 'group',
      label: 'Contact Information',
      admin: {
        description: dedent`
          This section describes your contact details, including your phone number and email address.
          These details are used on the website like in the footer section, to generate structured data and to render the resume document.
        `,
        components: {
          Description: '@/components/AdminPanel#DescriptionWithNewline',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'telephone',
              type: 'text',
            },
            {
              name: 'email',
              label: 'Email',
              type: 'email',
            },
          ],
        },
        {
          name: 'sameAs',
          type: 'array',
          admin: {
            description: dedent`
              This section describes links to your profiles on other platforms, such as social media accounts or personal websites.
            `,
            components: {
              Description: '@/components/AdminPanel#DescriptionWithNewline',
              RowLabel: '@/globals/SettingsUserMeta/components/SameAsRowLabel',
            },
          },
          fields: [
            {
              type: 'row',
              fields: [
                IconField({ overrides: { admin: { width: '20%' } } }),
                {
                  name: 'name',
                  type: 'text',
                  admin: {
                    width: '40%',
                  },
                },
                {
                  name: 'url',
                  label: 'URL',
                  type: 'text',
                  admin: {
                    width: '40%',
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    {
      name: 'description',
      type: 'text',
      localized: true,
    },

    {
      name: 'worksFor',
      type: 'group',
      admin: {
        description: dedent`
           This section describes the organization you work for.
           It can be used to generate structured data about your employment.
        `,
        components: {
          Description: '@/components/AdminPanel#DescriptionWithNewline',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
            },
            {
              name: 'url',
              label: 'URL',
              type: 'text',
            },
          ],
        },
        AddressField(),
      ],
    },
    AddressField(),
  ],
  versions: false,
}
