import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { BilingualRichTextField } from '@/fields/BilingualRichText'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { generateResumeDocumentHook } from '@/lib/hooks/collection'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

import { calculateJobInterval } from './hooks/calculateJobInterval'
import { enqueueCalculateSkillTagInterval } from './hooks/enqueueCalculateSkillTagInterval'

export const ResumeJobs: CollectionConfig<CollectionSlug['ResumeJobs']> = {
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
    update: authenticated,
    create: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [
      enqueueCalculateSkillTagInterval,
    ],
    afterOperation: [
      generateResumeDocumentHook,
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
            BilingualRichTextField({
              name: 'task',
              layout: 'row',
              editorVariant: 'inline',
              required: true,
              label: false,
            }),
          ],
        },
      ],
    },

    {
      name: 'startDate',
      label: 'Employment Start',
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
      label: 'Employment End',
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
      name: 'interval',
      label: 'Employment (months)',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          calculateJobInterval,
        ],
      },
    },

    {
      type: 'relationship',
      name: 'skillTags',
      relationTo: [
        CollectionSlug.ResumeSkillTags,
      ],
      // filterOptions: () => {
      //   return {
      //     _status: {
      //       equals: 'published',
      //     },
      //   }
      // },
      hasMany: true,
      admin: {
        appearance: 'select',
        position: 'sidebar',
        allowCreate: true,
        allowEdit: true,
        isSortable: true,
      },
    },

    GeneratorFlagsField(),
  ],
  trash: true,
  versions: false,
}
