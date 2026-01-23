import { ArrayField } from 'payload'

export const CustomerLogosField = (): ArrayField => (
    {
      label: 'Customer Logos',
      name: 'customerLogos',
      type: 'array',
      interfaceName: 'CustomerLogos',
      admin: {
        isSortable: true,
        initCollapsed: false,
        className: 'customers',
        components: {
          RowLabel: '@/fields/CustomerLogos/RowLabel',
        },
      },
      fields: [
        {
          name: 'field',
          type: 'ui',
          admin: {
            components: {
              Field: '@/fields/CustomerLogos/LogoField',
            },
          },
        },
        {
          name: 'logo',
          type: 'textarea',
          label: false,
          required: true,
          admin: {
            hidden: true,
          },
        },
        {
          name: 'name',
          type: 'text',
          label: false,
          required: true,
          validate: (value?: string) => (typeof value === 'string' && value.length > 2 ? true : ''),
          admin: {
            hidden: true,
          },
        },
      ],
    })
