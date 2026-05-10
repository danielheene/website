import { startCase } from 'lodash-es'
import type { Field, GroupField } from 'payload'

import { resolveAddressData } from '@/fields/Address/hooks/resolveAddressData'
import { syncAddressDataBetweenLocale } from '@/fields/Address/hooks/syncAddressDataBetweenLocale'
import { cn } from '@/lib/cn'

const fields: Field[] = [
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
    admin: {
      className: cn([
        '[&_ul]:w-auto [&_ul]:mx-[calc(var(--base)/-4)]',
        '[&_li]:mx-[calc(var(--base)/4)] [&_li]:px-0 [&_li]:basis-[calc(50%-var(--base)/2)]',
      ]),
      readOnly: true,
    },
  },
]

type AddressFieldProps = {
  name?: string
  label?: string
  description?: string
}

export const AddressField = ({ name = 'address', label, description }: AddressFieldProps = {}): GroupField => ({
  name,
  label: label ?? startCase(name),
  type: 'group',
  admin: {
    hideGutter: true,
    description,
    className: '[&_header]:w-full',
    components: {
      Label: '@/fields/Address/components/LabelComponent',
      Description: '@/components/AdminPanel#DescriptionWithNewline',
      Field: '@/fields/Address/components/FieldComponent',
    },
  },
  fields: ['en', 'de'].map((locale) => ({
    name: locale,
    type: 'group',
    interfaceName: 'AddressData',
    admin: {
      components: {
        Label: false,
      },
      hideGutter: true,
    },
    hooks: {
      beforeValidate: [resolveAddressData],
      beforeChange: [syncAddressDataBetweenLocale],
    },
    fields,
  })),
})
