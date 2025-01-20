import { anyone } from '@/payload/access/anyone'
import { IntroTab, SLUG } from './_shared'
import { revalidateCustomers } from './hooks/revalidateCustomers'
import { createGlobal } from '@/payload/utilities/schemaHelpers'

export const Customers = createGlobal({
  slug: SLUG.CUSTOMERS,
  label: 'Customers',
  access: {
    read: anyone,
  },
  hooks: {
    afterChange: [revalidateCustomers],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        IntroTab,
        {
          label: 'Customers',
          fields: [
            {
              label: 'Customer',
              name: 'entries',
              type: 'array',
              admin: {
                isSortable: true,
                initCollapsed: false,
                className: 'customers',
                components: {
                  Label: false,
                  RowLabel: '/payload/components/CustomersRowLabel',
                },
              },
              fields: [
                {
                  name: 'logo',
                  type: 'text',
                  label: false,
                  admin: {
                    className: 'customer__logo',
                    components: {
                      Field: '/payload/components/CustomerLogoField',
                    },
                  },
                },
                {
                  name: 'title',
                  type: 'text',
                  label: false,
                  admin: {
                    placeholder: 'Title',
                    className: 'customer__title',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'anchor',
      label: 'Scroll Anchor',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
  ],
})
