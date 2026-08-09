import { CollectionConfig } from 'payload'

import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { generateResumeDocumentHook } from '@/lib/hooks/collection'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

export const ResumeSkillTags: CollectionConfig<CollectionSlug['ResumeSkillTags']> = {
  slug: CollectionSlug.ResumeSkillTags,
  labels: {
    singular: 'Skill Tag',
    plural: 'Skill Tags',
  },
  typescript: {
    interface: 'ResumeSkillTagData',
  },
  hooks: {
    afterOperation: [
      generateResumeDocumentHook,
    ],
  },
  orderable: true,
  admin: {
    useAsTitle: 'title',
    group: AdminGroup.Resume,
    defaultColumns: [
      'title',
      'slug',
      'interval',
    ],
    disableCopyToLocale: true,
  },
  fields: [
    TitleField({
      overrides: {
        label: 'Title',
      },
    }),

    SlugField({
      fieldToUse: 'title',
    }),

    {
      type: 'number',
      name: 'interval',
      label: 'Employment (months)',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },

    // {
    //   type: 'number',
    //   name: 'interval',
    //   hooks: {
    //     afterRead: [
    //       async ({ req, originalDoc }) => {
    //         const payload = await getPayload({
    //           config,
    //         })
    //         const { docs = [] } = await payload.find({
    //           collection: CollectionSlug.ResumeJobs,
    //           pagination: false,
    //           limit: 0,
    //           draft: false,
    //           depth: 1,
    //           select: {
    //             startDate: true,
    //             endDate: true,
    //             skillTags: true,
    //           },
    //           // where: {
    //           //   skillTags: {
    //           //     contains: originalDoc.id,
    //           //   },
    //           // },
    //         })
    //
    //         const intervals: Interval[] = docs.map(({ startDate, endDate }) => [
    //           new Date(startDate),
    //           endDate ? new Date(endDate) : new Date(),
    //         ])
    //         console.log(intervals)
    //
    //         const mergedIntervals = Intervals.mergeIntervals(intervals)
    //
    //         console.log(mergedIntervals)
    //
    //         return mergedIntervals.reduce(
    //           (acc, interval) => acc + differenceInMonths(...interval),
    //           0,
    //         )
    //       },
    //     ],
    //   },
    // },

    // {
    //   type: 'join',
    //   virtual: true,
    //   name: 'resumeJobs',
    //   defaultLimit: 999,
    //   collection: CollectionSlug.ResumeJobs,
    //   hasMany: true,
    //   on: 'skillTags',
    // },
  ],
}
