import { deepMerge, type Field, type GroupField, type OptionObject } from 'payload'

import { IconField } from '@/fields/Icon'
import { isValidCustomURL } from '@/fields/Link/lib/isValidCustomURL'
import { TemplateField } from '@/fields/Template'
import { CollectionSlug } from '@/types/collections'
import type { LinkFieldData } from '@/types/payload'

export const appearanceOptions: Record<string, OptionObject> = {
  default: {
    label: 'Default',
    value: 'default',
  },

  outline: {
    label: 'Outline',
    value: 'outline',
  },
}

type LinkFieldOverrides = Partial<Omit<GroupField, 'name' | 'type' | 'fields'>>
type LinkFieldConfig = {
  withAppearanceSelect?: boolean
  overrides?: LinkFieldOverrides
}

export const LinkField = ({
  withAppearanceSelect = false,
  overrides = {},
}: LinkFieldConfig = {}): GroupField =>
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
              name: 'reference',
              type: 'relationship',
              admin: {
                width: '75%',
                components: {
                  Field: {
                    path: '@/fields/Link/components/TargetField',
                  },
                },
              },
              label: 'Links to',
              maxDepth: 1,
              relationTo: [
                CollectionSlug['Pages'],
                CollectionSlug['BlogPosts'],
                CollectionSlug['BlogTopics'],
              ],
              validate: (
                value: unknown,
                {
                  siblingData,
                }: {
                  siblingData: LinkFieldData
                },
              ) => (value || siblingData?.url ? true : 'Select a document, or enter a custom URL.'),
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
          ],
        },
        {
          // Written by the target select above, never rendered on its own. Still a
          // real, validated field so that imports, seeds and API writes are checked.
          name: 'url',
          type: 'text',
          admin: {
            hidden: true,
          },
          label: 'Custom URL',
          validate: (value: unknown) =>
            !value || isValidCustomURL(value)
              ? true
              : 'Enter an absolute http(s) URL, a mailto:/tel: link, a path starting with “/”, or a “#” anchor.',
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
            TemplateField({
              name: 'label',
              label: 'Label',
              defaultValue: '{title}',
              description:
                'Defaults to the title of the linked document. Overwrite it with any text, or mix the two — `{title}` is substituted on render.',
              overrides: {
                required: true,
                admin: {
                  width: '70%',
                  components: {
                    Field: {
                      path: '@/fields/Link/components/LabelField',
                    },
                  },
                },
              },
            }),
            IconField({
              name: 'iconAfter',
              overrides: {
                admin: {
                  width: '15%',
                },
              },
            }),
          ],
        },
        {
          // Read-only projection of `label` with `{title}` substituted. Rendered by
          // CMSLink, which is a client component and so cannot resolve it itself.
          name: 'resolvedLabel',
          type: 'text',
          virtual: true,
          admin: {
            hidden: true,
          },
          hooks: {
            afterRead: [
              // Loaded on first read rather than imported at the top of this
              // module, and that is load-bearing. `renderLinkLabel` reaches
              // `renderTemplate.core`, which imports the Payload config — and
              // the config imports this module back through the blocks barrel
              // and the RichText field. A static import would therefore make
              // `LinkField` a cycle participant that is only safe when the
              // config happens to be the entry point; entering the graph from
              // any other module (a field test, a route that pulls a field
              // module directly) would leave `LinkField` uninitialised by the
              // time `LinkGroupField` calls it. Deferring the import to call
              // time keeps the config graph acyclic at module scope.
              async (args) =>
                (await import('@/fields/Link/hooks/renderLinkLabel')).renderLinkLabel(args),
            ],
          },
        },
        {
          name: 'iconOnly',
          type: 'checkbox',
          label: 'Icon only',
          admin: {
            description: 'Hides the label visually and uses it as the accessible name instead.',
          },
        },
        withAppearanceSelect
          ? {
              name: 'appearance',
              type: 'select',
              admin: {
                description: 'Choose how the link should be rendered.',
              },
              defaultValue: 'default',
              options: Object.values(appearanceOptions),
            }
          : false,
      ].filter(Boolean) as Field[],
    },
    overrides,
  )
