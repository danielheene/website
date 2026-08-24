// src/fields/Link/index.ts
import { deepMerge, FieldHookArgs, type GroupField } from 'payload'

import { cn } from 'tailwind-variants'

import { IconField } from '@/fields/Icon'
import { isValidCustomURL } from '@/fields/Link/lib/isValidCustomURL'
import { resolveLinkTypeMode } from '@/fields/Link/lib/resolveLinkTypeMode'
import { CollectionSlug } from '@/types/collections'
import { LinkFieldData } from '@/types/payload'

type LinkFieldOverrides = Partial<Omit<GroupField, 'name' | 'type' | 'fields'>>
type LinkFieldConfig = {
  overrides?: LinkFieldOverrides
}

/**
 * A link: either a reference to a CMS document or a custom URL, with an
 * optional leading/trailing icon and a required label.
 *
 * Three rows:
 * 1. `linkType` (which mode is active, 50%), `newTab` (25%), `iconOnly` (25%)
 * 2. `doc` (relationship dropdown) or `url` (text input) — only one is
 *    ever visible, switched by `linkType`
 * 3. `iconBefore`, `label`, `iconAfter` — `iconAfter` hides when `iconOnly`
 *    is checked, since an icon-only link renders a single leading icon plus
 *    an invisible `aria-label` (see `CMSLink`)
 *
 * `linkType` and `doc`'s names and values deliberately match lexical's own
 * built-in `LinkFeature` base fields (`linkType: 'internal' | 'custom'`,
 * `doc`) — this field exists for contexts `LinkFeature` doesn't cover
 * (`LinkGroupBlock`, Footer nav, and similar group/array fields with no
 * selected editor text to derive a label or icon from), but shares the same
 * field names so `resolveLinkTarget`/`CMSLink`/the RichText `link` converter
 * can read either shape with the same logic instead of two parallel ones.
 */
export const LinkField = ({ overrides = {} }: LinkFieldConfig = {}): GroupField =>
  deepMerge<GroupField, LinkFieldOverrides>(
    {
      name: 'link',
      type: 'group',
      label: false,
      interfaceName: 'LinkFieldData',
      admin: {
        className: 'link-field',
        hideGutter: true,
      },
      hooks: {
        beforeChange: [
          async ({
            value,
          }: FieldHookArgs<
            {
              id: string
            },
            LinkFieldData
          >) => {
            if (value.linkType === 'internal') delete value.url
            if (value.linkType === 'custom') delete value.doc
            if (value.iconOnly) delete value.iconAfter
            return value
          },
        ],
      },
      fields: [
        {
          type: 'row',
          admin: {
            className: cn([
              '[&_.field-type.checkbox]:justify-end',
              String.raw`[&_.checkbox-input_.checkbox-input\_\_input]:h-10`,
              String.raw`[&_.checkbox-input_.checkbox-input\_\_input]:w-10`,
              String.raw`[&_.checkbox-input_.checkbox-input\_\_icon>.icon]:w-6`,
              String.raw`[&_.checkbox-input_.checkbox-input\_\_icon>.icon]:h-6`,
              String.raw`[&_.checkbox-input_.checkbox-input\_\_icon>.icon]:m-2`,
            ]),
          },
          fields: [
            {
              name: 'linkType',
              type: 'select',
              defaultValue: 'internal',
              label: 'Links to',
              options: [
                {
                  label: 'Linked document',
                  value: 'internal',
                },
                {
                  label: 'Custom URL',
                  value: 'custom',
                },
              ],
              required: true,
            },
            {
              name: 'newTab',
              type: 'checkbox',
              label: 'New Tab',
              admin: {
                style: {
                  flex: '0 1 auto',
                  flexGrow: 0,
                },
              },
            },
            {
              name: 'iconOnly',
              type: 'checkbox',
              label: 'Icon Only',
              admin: {
                style: {
                  flex: '0 1 auto',
                  flexGrow: 0,
                },
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'doc',
              type: 'relationship',
              admin: {
                allowCreate: false,
                condition: (_, siblingData) => resolveLinkTypeMode(siblingData) === 'internal',
              },
              hooks: {
                beforeChange: [
                  async ({ value, siblingData }) =>
                    resolveLinkTypeMode(siblingData) === 'internal' ? value : null,
                ],
              },
              label: 'Document',
              maxDepth: 1,
              relationTo: [
                CollectionSlug.Pages,
                CollectionSlug.BlogPosts,
                CollectionSlug.BlogTopics,
              ],
              validate: (
                value: unknown,
                {
                  siblingData,
                }: {
                  siblingData: Record<string, unknown>
                },
              ) =>
                resolveLinkTypeMode(siblingData) !== 'internal' || value
                  ? true
                  : 'Select a document.',
            },
            {
              name: 'url',
              type: 'text',
              admin: {
                condition: (_, siblingData) => resolveLinkTypeMode(siblingData) === 'custom',
              },
              hooks: {
                beforeChange: [
                  async ({ value, siblingData }) =>
                    resolveLinkTypeMode(siblingData) === 'custom' ? value : null,
                ],
              },
              label: 'Custom URL',
              validate: (
                value: unknown,
                {
                  siblingData,
                }: {
                  siblingData: Record<string, unknown>
                },
              ) => {
                if (resolveLinkTypeMode(siblingData) !== 'custom') return true
                if (!value) return 'Enter a custom URL.'

                return isValidCustomURL(value)
                  ? true
                  : 'Enter an absolute http(s) URL, a mailto:/tel: link, a path starting with “/”, or a “#” anchor.'
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            IconField({
              name: 'iconBefore',
            }),
            {
              name: 'label',
              type: 'text',
              label: 'Label',
              required: true,
            },
            IconField({
              name: 'iconAfter',
              overrides: {
                admin: {
                  condition: (_, siblingData) => !siblingData?.iconOnly,
                },
                hooks: {
                  beforeChange: [
                    async ({ value, siblingData }) => {
                      if (!value || siblingData?.iconOnly) return null
                      return value
                    },
                  ],
                },
              },
            }),
          ],
        },
      ],
    },
    overrides,
  )
