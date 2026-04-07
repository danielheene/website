import type { GroupField } from 'payload'

import { resolveAddressData } from '@/fields/Address/hooks/resolveAddressData'
import { resolveAddressDataForOtherLocale } from '@/fields/Address/hooks/resolveAddressDataForOtherLocale'

type AddressFieldProps = {
  name?: string
  description?: string
  hideGutter?: boolean
}

export const AddressField = ({ name = 'address', description, hideGutter = true }: AddressFieldProps = {}): GroupField => ({
  name,
  type: 'group',
  localized: true,
  interfaceName: 'AddressData',
  hooks: {
    beforeChange: [resolveAddressData],
    afterChange: [resolveAddressDataForOtherLocale],
  },
  admin: {
    hideGutter: true,
    description,
    components: {
      Description: '@/components/AdminPanel#DescriptionWithNewline',
    },
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'street',
          type: 'text',
          defaultValue: '',
          admin: {
            width: '75%',
          },
        },
        {
          name: 'number',
          type: 'text',
          defaultValue: '',
          admin: {
            width: '25%',
          },
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
          admin: {
            width: '25%',
          },
        },
        {
          name: 'place',
          type: 'text',
          defaultValue: '',
          admin: {
            width: '75%',
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
          admin: {
            width: '25%',
          },
        },
        {
          name: 'countryName',
          type: 'text',
          defaultValue: '',
          admin: {
            width: '75%',
          },
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
            width: '50%',
          },
        },
        {
          name: 'locality',
          type: 'text',
          defaultValue: '',
          admin: {
            readOnly: true,
            width: '50%',
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
})
