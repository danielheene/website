import { AdminGroup, CollectionSlug, GlobalSlug } from '@custom-types'
import { revalidateTag } from 'next/cache'
import type { GlobalConfig, FieldHookArgs } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { generateGeoCoordinates } from '@/lib/generateGeoCoordinates'

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
      name: 'name',
      type: 'text',
    },
    {
      name: 'jobTitle',
      type: 'text',
    },
    {
      name: 'url',
      type: 'text',
    },
    {
      name: 'github',
      type: 'text',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: CollectionSlug.MediaImages,
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'telephone',
      type: 'text',
    },
    {
      name: 'description',
      type: 'text',
      localized: true,
    },
    {
      name: 'sameAs',
      type: 'array',
      fields: [
        {
          name: 'url',
          label: false,
          type: 'text',
          admin: {
            placeholder: 'URL',
          },
        },
      ],
    },
    {
      name: 'duns',
      type: 'text',
    },
    {
      name: 'birthDate',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'yyyy-MM-dd',
        },
      },
    },
    {
      name: 'birthPlace',
      type: 'text',
    },
    {
      name: 'gender',
      type: 'text',
    },
    {
      name: 'homeLocation',
      type: 'text',
    },
    {
      name: 'knowsLanguage',
      type: 'array',
      fields: [
        {
          name: 'language',
          type: 'text',
          localized: true,
        },
      ],
    },
    {
      name: 'vatID',
      type: 'text',
    },
    {
      name: 'workLocation',
      type: 'text',
    },
    {
      name: 'worksFor',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
    {
      name: 'address',
      type: 'group',
      localized: true,
      interfaceName: 'UserMetaAddress',
      hooks: {
        beforeValidate: [
          async ({ value, previousValue, req, context }: FieldHookArgs) => {
            if (context.disableHook) return value

            const requiredKeys = ['street', 'number', 'postCode', 'place', 'countryCode']
            const requiredKeysChanged = requiredKeys.some(key => previousValue[key] !== value[key])
            const requiredKeysAvailable = requiredKeys.every(key => Object.hasOwn(value, key) && value[key] !== '')

            if (!requiredKeysChanged || !requiredKeysAvailable) return value

            const locale = req.locale === 'de' ? 'de' : 'en'
            context.otherLocale = locale === 'de' ? 'en' : 'de'
            return await generateGeoCoordinates({ locale, ...value })
          },
        ],
        afterChange: [
          async ({ value, req, context }: FieldHookArgs) => {
            if (context.disableHook) return

            const locale = context.otherLocale === 'de' ? 'de' : 'en'
            const address = await generateGeoCoordinates({ locale, ...value })

            await req.payload.updateGlobal({
              slug: GlobalSlug.SettingsUserMeta,
              data: {
                address,
              },
              context: {
                disableHook: true,
              },
              locale,
            })
          },
        ],
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'street',
              type: 'text',
              defaultValue: '',
            },
            {
              name: 'number',
              type: 'text',
              defaultValue: '',
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'postCode',
              type: 'text',
              defaultValue: '',
            },
            {
              name: 'place',
              type: 'text',
              defaultValue: '',
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'region',
              type: 'text',
              defaultValue: '',
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'locality',
              type: 'text',
              defaultValue: '',
              admin: {
                readOnly: true,
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'countryCode',
              type: 'text',
              minLength: 2,
              maxLength: 2,
              defaultValue: '',
              validate: (value: string) => {
                if (!value) return true
                return /^[A-Z]{2}$/.test(value) || 'Invalid country code'
              },
            },
            {
              name: 'countryName',
              type: 'text',
              defaultValue: '',
              admin: {
                readOnly: true,
              },
            },
          ],
        },
        {
          name: 'location',
          type: 'point',
          defaultValue: ['', ''],
          admin: {
            readOnly: true,
          },
        },
      ],
    },
  ],
  versions: false,
}
