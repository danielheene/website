import { anyone } from '@/payload/access/anyone'
import { IntroTab, SLUG } from './_shared'
import { revalidateProjects } from './hooks/revalidateProjects'
import { createGlobal } from '@/payload/utilities/schemaHelpers'
import {
  BoldFeature,
  FixedToolbarFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'

export const Projects = createGlobal({
  slug: SLUG.PROJECTS,
  label: 'Projects',
  access: {
    read: anyone,
  },
  hooks: {
    afterChange: [revalidateProjects],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        IntroTab,
        {
          label: 'Projects',
          fields: [
            {
              label: 'Project',
              name: 'entries',
              type: 'array',
              admin: {
                isSortable: true,
                initCollapsed: false,
                className: 'projects',
                components: {
                  Label: false,
                },
              },
              fields: [
                {
                  type: 'row',
                  admin: {
                    className: 'projects__row',
                  },
                  fields: [
                    {
                      name: 'headline',
                      type: 'text',
                      required: true,
                      admin: {
                        style: { gridArea: 'headline' },
                      },
                    },
                    {
                      name: 'subline',
                      type: 'text',
                      required: true,
                      admin: {
                        style: { gridArea: 'subline' },
                      },
                    },
                    {
                      name: 'richText',
                      type: 'richText',
                      editor: lexicalEditor({
                        features: [
                          ItalicFeature(),
                          BoldFeature(),
                          UnderlineFeature(),
                          OrderedListFeature(),
                          UnorderedListFeature(),
                          ParagraphFeature(),
                          LinkFeature(),
                          FixedToolbarFeature({ disableIfParentHasFixedToolbar: true }),
                        ],
                      }),
                      label: false,
                      admin: {
                        style: { gridArea: 'richtext' },
                      },
                    },
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      filterOptions: {
                        mimeType: { contains: 'image' },
                      },
                      admin: {
                        style: { gridArea: 'image' },
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
      name: 'anchor',
      label: 'Scroll Anchor',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
  ],
})
