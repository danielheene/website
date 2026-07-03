import { AdminGroup } from '@custom-types'
import { differenceInMonths } from 'date-fns'
import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { RichTextField } from '@/fields/RichText'
import { enqueueGenerateResumeDocuments } from '@/lib/hooks/enqueueGenerateResumeDocuments'
import { revalidateResumeSectionCollectionHook } from '@/lib/hooks/revalidateResumeSection'
import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'

export const ResumeJobs: CollectionConfig<CollectionSlug.ResumeJobs> = {
  slug: CollectionSlug.ResumeJobs,
  labels: {
    singular: 'Job',
    plural: 'Jobs',
  },
  typescript: {
    interface: 'ResumeJobData',
  },
  access: {
    read: authenticated,
    admin: authenticated,
    update: authenticated,
    create: authenticated,
    delete: authenticated,
    unlock: authenticated,
    readVersions: authenticated,
  },
  hooks: {
    afterChange: [
      revalidateResumeSectionCollectionHook(GlobalSlug.ResumeExperience),
      enqueueGenerateResumeDocuments,
    ],
  },
  admin: {
    useAsTitle: 'employer',
    group: AdminGroup.Resume,
    defaultColumns: [
      'employer',
      'title',
      'startDate',
      'endDate',
      'interval',
    ],
    disableCopyToLocale: true,
  },
  defaultSort: [
    'startDate',
  ],
  // defaultPopulate: {
  //   employer: true,
  //   title: true,
  //   startDate: true,
  //   endDate: true,
  //   tasks: true,
  //   // skills: true,
  // },
  // disableDuplicate: true,
  // forceSelect: {
  //   employer: true,
  //   title: true,
  //   startDate: true,
  //   endDate: true,
  //   employmentInterval: true,
  // },
  fields: [
    {
      type: 'group',
      label: 'Job Details',
      admin: {
        hideGutter: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'employer',
              type: 'text',
              required: true,
              admin: {
                width: '50%',
              },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: {
                width: '50%',
              },
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      admin: {
        hideGutter: true,
      },
      fields: [
        {
          type: 'array',
          name: 'tasks',
          label: 'Tasks',
          labels: {
            singular: 'Task',
            plural: 'Tasks',
          },
          defaultValue: [],
          fields: [
            {
              type: 'group',
              name: 'task',
              label: false,
              admin: {
                hideGutter: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    RichTextField({
                      name: 'en',
                      editorVariant: 'inline',
                      overrides: {
                        label: 'English',
                        required: true,
                        admin: {
                          width: '50%',
                        },
                      },
                    }),
                    RichTextField({
                      name: 'de',
                      editorVariant: 'inline',
                      overrides: {
                        label: 'German',
                        required: true,
                        admin: {
                          width: '50%',
                        },
                      },
                    }),
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      admin: {
        hideGutter: true,
      },
      fields: [
        {
          type: 'relationship',
          name: 'skills',
          relationTo: CollectionSlug.ResumeSkills,
          filterOptions: () => {
            return {
              _status: {
                equals: 'published',
              },
            }
          },
          hasMany: true,
          required: true,
          admin: {
            appearance: 'drawer',
            allowCreate: true,
            allowEdit: true,
            isSortable: true,
          },
        },
      ],
    },

    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
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
        position: 'sidebar',
        date: {
          pickerAppearance: 'monthOnly',
          displayFormat: 'MM/yyyy',
        },
      },
    },
    {
      name: 'employmentInterval',
      label: 'Employment (months)',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          async ({ siblingData: { startDate, endDate } }) => {
            if (!startDate) return 0

            const start = Date.parse(startDate)
            const end = endDate ? Date.parse(endDate) : new Date()

            return differenceInMonths(end, start)
          },
        ],
      },
    },
  ],
  trash: true,
  versions: {
    drafts: {
      autosave: false,
      localizeStatus: false,
      schedulePublish: false,
      validate: false,
    },
    maxPerDoc: 5,
  },
}
