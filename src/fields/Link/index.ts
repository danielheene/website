// src/fields/Link/index.ts
import { deepMerge, type GroupField } from 'payload'

import { IconField } from '@/fields/Icon'
import { isValidCustomURL } from '@/fields/Link/lib/isValidCustomURL'
import { resolveLinkTypeMode } from '@/fields/Link/lib/resolveLinkTypeMode'
import { CollectionSlug } from '@/types/collections'

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
 * 2. `reference` (relationship dropdown) or `url` (text input) — only one is
 *    ever visible, switched by `linkType`
 * 3. `iconBefore`, `label`, `iconAfter` — `iconAfter` hides when `iconOnly`
 *    is checked, since an icon-only link renders a single leading icon plus
 *    an invisible `aria-label` (see `CMSLink`)
 *
 * `linkType`'s name and values deliberately mirror lexical's own built-in
 * `LinkFeature` base field (`linkType: 'internal' | 'custom'`): this field's
 * `'reference'` stands in for lexical's `'internal'`, and `'url'` for its
 * `'custom'`. This is safe because `LinkField().fields` is always spread as
 * an *array* into `LinkFeature({ fields: [...] })` (see `RichText/index.ts`),
 * and lexical's `transformExtraFields` *replaces* its base fields with these
 * rather than merging them — so there is only ever one `linkType` field on a
 * link node at a time, never two colliding definitions.
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
      fields: [
        {
          type: 'row',
          admin: {
            className: 'link-field__options',
          },
          fields: [
            {
              name: 'linkType',
              type: 'select',
              admin: {
                width: '50%',
              },
              defaultValue: 'reference',
              label: 'Links to',
              options: [
                {
                  label: 'Linked document',
                  value: 'reference',
                },
                {
                  label: 'Custom URL',
                  value: 'url',
                },
              ],
              required: true,
            },
            {
              name: 'newTab',
              type: 'checkbox',
              admin: {
                className: 'link-field__new-tab-option',
                width: '25%',
              },
              label: 'Open in new tab',
            },
            {
              name: 'iconOnly',
              type: 'checkbox',
              admin: {
                width: '25%',
              },
              label: 'Icon only',
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'reference',
              type: 'relationship',
              admin: {
                condition: (_, siblingData) => resolveLinkTypeMode(siblingData) === 'reference',
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
                resolveLinkTypeMode(siblingData) !== 'reference' || value
                  ? true
                  : 'Select a document.',
            },
            {
              name: 'url',
              type: 'text',
              admin: {
                condition: (_, siblingData) => resolveLinkTypeMode(siblingData) === 'url',
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
                if (resolveLinkTypeMode(siblingData) !== 'url') return true
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
              overrides: {
                admin: {
                  width: '15%',
                },
              },
            }),
            {
              name: 'label',
              type: 'text',
              admin: {
                width: '70%',
              },
              label: 'Label',
              required: true,
            },
            IconField({
              name: 'iconAfter',
              overrides: {
                admin: {
                  condition: (_, siblingData) => !siblingData?.iconOnly,
                  width: '15%',
                },
              },
            }),
          ],
        },
      ],
    },
    overrides,
  )
