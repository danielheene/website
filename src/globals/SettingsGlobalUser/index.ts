import type { FieldHookArgs, GlobalConfig, TextField, ValidateOptions } from 'payload'

import { AddressField } from '@/fields/Address'
import { IconField } from '@/fields/Icon'
import { SectionGroupField } from '@/fields/SectionGroup'
import { authenticated } from '@/lib/access/authenticated'
import { translate } from '@/lib/i18n'
import { generateResumeDocumentHook } from '@/lib/payloadHooks/global'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'
import { type GlobalData, GlobalSlug } from '@/types/globals'
import type { GlobalUserSettings as GlobalUserSettingsType, PhoneNumberData } from '@/types/payload'
import { LANGUAGE_CODE, LANGUAGE_PROFICIENCY } from '@/types/select-options'

import { revalidateDocument } from './hooks/revalidateDocument'
import { trimValueBeforeValidate } from './hooks/trimValueBeforeValidate'
import {
  formatPhoneNumber,
  getPhoneNumberURI,
  normalizePhoneNumber,
  validatePhoneNumber,
} from './phoneNumber'

export const GlobalUserSettings: GlobalConfig<GlobalSlug['GlobalUserSettings']> = {
  slug: GlobalSlug.GlobalUserSettings,
  label: 'Global User Settings',
  access: {
    read: authenticated,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateDocument, generateResumeDocumentHook],
  },
  admin: {
    group: AdminGroup.Settings,
    description:
      "These user details are stored centrally and used throughout the website wherever the user's profile information is needed.",
  },
  typescript: {
    interface: 'GlobalUserSettings',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Personal',
          fields: [
            SectionGroupField({
              name: 'portrait',
              label: 'Profile Picture',
              description: `
                Upload your profile picture here.
                You can choose between a regular and a duotone version.
               `,
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'regular',
                      type: 'upload',
                      relationTo: [CollectionSlug.MediaImages],
                      defaultValue: null,
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'duotone',
                      type: 'upload',
                      relationTo: [CollectionSlug.MediaImages],
                      defaultValue: null,
                      admin: {
                        width: '50%',
                      },
                    },
                  ],
                },
              ],
            }),
            SectionGroupField({
              label: 'Personal Information',
              hideGutter: false,
              description: `
                  This section describes personal information about you.
                `,
              fields: [
                {
                  name: 'url',
                  type: 'text',
                  defaultValue: process.env.SERVER_URL,
                  admin: {
                    hidden: true,
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'firstName',
                      type: 'text',
                      hooks: {
                        beforeValidate: [trimValueBeforeValidate],
                      },
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'lastName',
                      type: 'text',
                      hooks: {
                        beforeValidate: [trimValueBeforeValidate],
                      },
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'name',
                      type: 'text',
                      virtual: true,
                      hooks: {
                        afterRead: [
                          ({
                            siblingData,
                          }: FieldHookArgs<
                            GlobalData<GlobalSlug['GlobalUserSettings']>,
                            string,
                            GlobalData<GlobalSlug['GlobalUserSettings']>
                          >) => {
                            return `${siblingData.firstName ?? ''} ${siblingData.lastName ?? ''}`.trim()
                          },
                        ],
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
                      hooks: {
                        beforeValidate: [trimValueBeforeValidate],
                      },
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'pronouns',
                      type: 'text',
                      hooks: {
                        beforeValidate: [trimValueBeforeValidate],
                      },
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
                      name: 'jobTitle',
                      type: 'text',
                      hooks: {
                        beforeValidate: [trimValueBeforeValidate],
                      },
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'homeLocation',
                      type: 'text',
                      hooks: {
                        beforeValidate: [trimValueBeforeValidate],
                      },
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
                      hooks: {
                        beforeValidate: [trimValueBeforeValidate],
                      },
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
            }),
            {
              type: 'group',
              fields: [
                {
                  name: 'languages',
                  label: 'Languages',
                  type: 'array',
                  admin: {
                    components: {
                      RowLabel: '@/globals/SettingsGlobalUser/components/LanguagesRowLabel',
                    },
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'language',
                          type: 'select',
                          interfaceName: 'LanguageCode',
                          options: Object.values(LANGUAGE_CODE).map((value) => ({
                            value,
                            label: translate('en', `language.name.${value}`),
                          })),
                          admin: {
                            width: '50%',
                          },
                        },
                        {
                          name: 'proficiency',
                          type: 'select',
                          interfaceName: 'LanguageProficiency',
                          options: Object.values(LANGUAGE_PROFICIENCY).map((value) => ({
                            value,
                            label: translate('en', `language.proficiency.${value}`),
                          })),
                          admin: {
                            width: '50%',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            SectionGroupField({
              label: 'Tax Information',
              hideGutter: false,
              description: `
                  This section describes your tax information, including your Tax ID, VAT ID and DUNS number.
                  Those informations are also used on the legal-notice page.
                `,
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'taxID',
                      label: 'Tax ID',
                      type: 'text',
                      hooks: {
                        beforeValidate: [trimValueBeforeValidate],
                      },
                      admin: {
                        width: '33.3%',
                      },
                    },
                    {
                      name: 'vatID',
                      label: 'VAT ID',
                      type: 'text',
                      hooks: {
                        beforeValidate: [trimValueBeforeValidate],
                      },
                      admin: {
                        width: '33.3%',
                      },
                    },
                    {
                      name: 'duns',
                      label: 'DUNS',
                      type: 'text',
                      hooks: {
                        beforeValidate: [trimValueBeforeValidate],
                      },
                      admin: {
                        width: '33.3%',
                      },
                    },
                  ],
                },
              ],
            }),
          ],
        },
        {
          label: 'Contact',
          fields: [
            SectionGroupField({
              label: 'Contact Information',
              hideGutter: false,
              description: `
                  This section describes your contact details, including your phone number and email address.
                  These details are used on the website like in the footer section, to generate structured data and to render the resume document.
                `,
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      type: 'group',
                      name: 'phoneNumber',
                      label: false,
                      interfaceName: 'PhoneNumberData',
                      admin: {
                        hideGutter: true,
                        width: '50%',
                      },
                      fields: [
                        {
                          name: 'value',
                          type: 'text',
                          label: 'Phone Number',
                          hasMany: false,
                          validate: (
                            value,
                            {
                              data,
                            }: ValidateOptions<
                              GlobalUserSettingsType,
                              PhoneNumberData,
                              TextField,
                              string
                            >,
                          ) => {
                            return validatePhoneNumber(value, data)
                          },
                          hooks: {
                            beforeValidate: [
                              trimValueBeforeValidate,
                              ({
                                value = '',
                                data,
                              }: FieldHookArgs<
                                GlobalUserSettingsType,
                                string,
                                GlobalUserSettingsType
                              >) => {
                                return normalizePhoneNumber(value, data)
                              },
                            ],
                          },
                        },
                        {
                          name: 'formatted',
                          type: 'text',
                          admin: {
                            hidden: true,
                          },
                          hooks: {
                            afterRead: [
                              ({
                                data,
                                siblingData,
                              }: FieldHookArgs<
                                GlobalUserSettingsType,
                                string,
                                PhoneNumberData
                              >) => {
                                return formatPhoneNumber(siblingData?.value, data)
                              },
                            ],
                          },
                        },
                        {
                          name: 'uri',
                          type: 'text',
                          admin: {
                            hidden: true,
                          },
                          hooks: {
                            afterRead: [
                              ({
                                data,
                                siblingData,
                              }: FieldHookArgs<
                                GlobalUserSettingsType,
                                string,
                                PhoneNumberData
                              >) => {
                                return getPhoneNumberURI(siblingData?.value, data)
                              },
                            ],
                          },
                        },
                      ],
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
            }),
            AddressField({
              description: `
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
                    description: `
                      This section describes links to your profiles on other platforms, such as social media accounts or personal websites.
                      Those links are also used in the footer of the website in the same order.
                    `,
                    components: {
                      Description: '@/fields/SectionGroup/components/DescriptionComponent',
                      RowLabel: '@/globals/SettingsGlobalUser/components/SameAsRowLabel',
                    },
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        IconField({
                          overrides: {
                            admin: {},
                          },
                        }),
                        {
                          name: 'name',
                          type: 'text',
                          admin: {},
                        },
                        {
                          name: 'url',
                          label: 'URL',
                          type: 'text',
                          admin: {},
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
            SectionGroupField({
              name: 'worksFor',
              label: 'Works For',
              hideGutter: false,
              description: `
                 This section describes the organization you work for.
                 It can be used to generate structured data about your employment.
              `,
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
            }),
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
