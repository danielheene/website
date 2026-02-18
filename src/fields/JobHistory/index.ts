import type { ArrayField } from 'payload'

import { TagList } from '@/fields/TagList'

import { sortJobHistoryByStartDate } from './hooks/sortJobHistoryByStartDate'

export const JobHistoryField = (): ArrayField => ({
  name: 'jobHistory',
  type: 'array',
  interfaceName: 'JobHistory',
  hooks: {
    beforeChange: [sortJobHistoryByStartDate],
  },
  admin: {
    isSortable: false,
    initCollapsed: false,
    className: 'job-history',
    components: {
      Label: false,
      beforeInput: ['@/fields/JobHistory/CSSInjector'],
      RowLabel: '@/fields/JobHistory/RowLabel',
    },
  },
  fields: [
    {
      type: 'row',
      admin: {
        className: 'job-history__row',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            className: 'job-history__title',
          },
        },
        {
          name: 'employer',
          type: 'text',
          required: true,
          admin: {
            className: 'job-history__employer',
          },
        },
        {
          name: 'startDate',
          type: 'date',
          required: true,
          admin: {
            className: 'job-history__start-date',
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
            className: 'job-history__end-date',
            date: {
              pickerAppearance: 'monthOnly',
              displayFormat: 'MM/yyyy',
            },
          },
        },
      ],
    },
    {
      type: 'array',
      name: 'content',
      defaultValue: [],
      fields: [
        {
          type: 'textarea',
          name: 'item',
          label: false,
          localized: true,
          admin: {
            rows: 3,
          },
        },
      ],
    },

    TagList({
      name: 'technologies',
    }),
  ],
})
