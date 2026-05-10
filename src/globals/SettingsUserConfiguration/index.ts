import { AdminGroup } from '@custom-types'
import dedent from 'dedent'
import { revalidateTag } from 'next/cache'
import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { AddressField } from '@/fields/Address'
import { IconField } from '@/fields/Icon'
import { getLanguageName, LANGUAGE_CODES } from '@/lib/languageNames'
import {
  getLanguageProficiencyLabel,
  PROFICIENCY_LEVEL,
} from '@/lib/languageProficiency'
import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'

export const SettingsUserConfiguration: GlobalConfig = {
  slug: GlobalSlug.SettingsUserConfiguration,
  label: 'User Meta',
  access: {
    read: authenticatedOrPublished,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      async ({ doc, context }) => {
        if (context.skipRevalidate) return doc
        revalidateTag(GlobalSlug.SettingsUserConfiguration)
      },
    ],
  },
  admin: {
    group: AdminGroup.Settings,
  },
  typescript: {
    interface: 'UserConfigurationData',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Personal',
          fields: [
            {
              type: 'group',
              name: 'portrait',
              label: 'Profile Picture',
              admin: {
                description: dedent`
                  Upload your profile picture here. You can choose between a regular and a duotone version.
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
                      name: 'regular',
                      type: 'upload',
                      relationTo: CollectionSlug.MediaImages,
                      defaultValue: null,
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'duotone',
                      type: 'upload',
                      relationTo: CollectionSlug.MediaImages,
                      defaultValue: null,
                      admin: {
                        width: '50%',
                      },
                    },
                  ],
                },
              ],
            },
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
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'jobTitle',
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
              type: 'group',
              fields: [
                {
                  name: 'languages',
                  label: 'Languages',
                  type: 'array',
                  admin: {
                    components: {
                      RowLabel:
                        '@/globals/SettingsUserConfiguration/components/LanguagesRowLabel',
                    },
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'language',
                          type: 'select',
                          admin: {
                            width: '50%',
                          },
                          options: Object.values(LANGUAGE_CODES).map(
                            (code) => ({
                              value: code,
                              label: `${getLanguageName(code)}`,
                            }),
                          ),
                        },
                        {
                          name: 'proficiency',
                          type: 'select',
                          admin: {
                            width: '50%',
                          },
                          options: Object.values(PROFICIENCY_LEVEL).map(
                            (level) => ({
                              value: level,
                              label: `${level}: ${getLanguageProficiencyLabel(level)}`,
                            }),
                          ),
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'group',
              label: 'Tax Information',
              admin: {
                description: dedent`
                  This section describes your tax information, including your Tax ID, VAT ID and DUNS number.
                  Those informations are also used on the legal-notice page.
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
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
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
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'email',
                      label: 'Email',
                      type: 'email',
                      admin: {
                        width: '50%',
                      },
                    },
                  ],
                },
              ],
            },
            AddressField({
              description: dedent`
                This section describes your address information.
                Those informations are also used on the legal-notice page.
              `,
            }),
            {
              type: 'group',
              fields: [
                {
                  name: 'sameAs',
                  label: 'Referenced Profiles',
                  labels: {
                    singular: 'Referenced Profile',
                    plural: 'Referenced Profiles',
                  },
                  type: 'array',
                  admin: {
                    description: dedent`
                      This section describes links to your profiles on other platforms, such as social media accounts or personal websites.
                      Those links are also used in the footer of the website in the same order.
                    `,
                    components: {
                      Description:
                        '@/components/AdminPanel#DescriptionWithNewline',
                      RowLabel:
                        '@/globals/SettingsUserConfiguration/components/SameAsRowLabel',
                    },
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        IconField({
                          overrides: {
                            admin: {
                              width: '20%',
                            },
                          },
                        }),
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
          ],
        },
        {
          label: 'Works For',
          fields: [
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
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'url',
                      label: 'URL',
                      type: 'text',
                      admin: {
                        width: '50%',
                      },
                    },
                  ],
                },
                AddressField(),
              ],
            },
          ],
        },
      ],
    },
    //
    // {
    //   name: 'description',
    //   type: 'text',
    //   localized: true,
    // },
  ],
  versions: false,
}
