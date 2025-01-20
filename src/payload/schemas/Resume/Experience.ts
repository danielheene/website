import { anyone } from '@/payload/access/anyone'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { tagInputField } from '@/payload/fields/tagInputField'
import { IntroTab, SLUG } from './_shared'
import { createGlobal } from '@/payload/utilities/schemaHelpers'
import { GlobalData } from '@custom-types'
import { sortEntriesByStartDate } from './hooks/sortEntriesByStartDate'
import { revalidateExperience } from './hooks/revalidateExperience'
import { calculateSkillSummary } from './hooks/calculateSkillSummary'

export const Experience = createGlobal({
  slug: SLUG.EXPERIENCE,
  label: 'Experience',
  access: {
    read: anyone,
  },
  hooks: {
    beforeChange: [sortEntriesByStartDate],
    afterChange: [calculateSkillSummary, revalidateExperience],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        IntroTab,
        {
          label: 'Experiences',
          fields: [
            {
              label: 'Entry',
              name: 'entries',
              type: 'array',
              defaultValue: [],
              hooks: {
                beforeChange: [
                  async ({ value, context }) => {
                    if (context.withoutHooks) return

                    const entries: GlobalData<'resumeExperience'>['entries'] = Array.isArray(value)
                      ? value
                      : []

                    return entries
                      .sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate))
                      .map((data, index) => Object.assign(data, { id: index + 1 }))
                  },
                ],
              },
              admin: {
                isSortable: false,
                initCollapsed: false,
                className: 'experience',
                components: {
                  Label: false,
                  RowLabel: '/payload/components/ExperienceRowLabel',
                },
              },
              fields: [
                {
                  type: 'row',
                  admin: {
                    className: 'experience__row',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      admin: {
                        style: { gridArea: 'title' },
                      },
                    },
                    {
                      name: 'employer',
                      type: 'text',
                      required: true,
                      admin: {
                        style: { gridArea: 'employer' },
                      },
                    },
                    {
                      name: 'startDate',
                      type: 'date',
                      required: true,
                      admin: {
                        style: { gridArea: 'startDate' },
                        date: {
                          pickerAppearance: 'monthOnly',
                          displayFormat: 'MM/yyyy',
                        },
                      },
                    },
                    {
                      name: 'endDate',
                      type: 'date',
                      admin: {
                        style: { gridArea: 'endDate' },
                        date: {
                          pickerAppearance: 'monthOnly',
                          displayFormat: 'MM/yyyy',
                        },
                      },
                    },
                  ],
                },
                {
                  name: 'richText',
                  type: 'richText',
                  editor: lexicalEditor({
                    features: ({ rootFeatures }) => [...rootFeatures],
                  }),
                  label: false,
                },
                tagInputField({
                  name: 'technologies',
                }),
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
    {
      name: 'skillSummary',
      label: 'Skill Summary',
      type: 'json',
      admin: {
        position: 'sidebar',
      },
    },
  ],
})
