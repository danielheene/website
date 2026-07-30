import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { generateResumeDocumentHook } from '@/lib/hooks/collection'
import { createFallbackToSiblingLocale } from '@/lib/hooks/createFallbackToSiblingLocale'
import { translate } from '@/lib/i18n'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'
import { SKILL_TYPE } from '@/types/select-options'

export const ResumeSkills: CollectionConfig<CollectionSlug['ResumeSkills']> = {
  slug: CollectionSlug['ResumeSkills'],
  labels: {
    singular: 'Skill',
    plural: 'Skills',
  },
  typescript: {
    interface: 'ResumeSkillData',
  },
  access: {
    read: authenticated,
    update: authenticated,
    create: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [],
    afterOperation: [
      generateResumeDocumentHook,
    ],
  },
  admin: {
    useAsTitle: 'name_label',
    group: AdminGroup.Resume,
    groupBy: true,
    defaultColumns: [
      'name_label',
      'caption_label',
      'type',
    ],
    disableCopyToLocale: true,
  },
  // defaultPopulate: {
  //   name: {
  //     en: true,
  //     de: true,
  //   },
  //   slug: true,
  //   type: true,
  //   experienceInterval: true,
  // },
  disableBulkEdit: true,
  disableDuplicate: true,
  lockDocuments: false,
  forceSelect: {
    name: true,
    caption: true,
    type: true,
  },
  fields: [
    /* -------------- Main  Content -------------- */
    {
      type: 'group',
      name: 'name',
      label: 'Name',
      admin: {
        hideGutter: true,
        disableListFilter: true,
        disableListColumn: true,
        disableGroupBy: true,
        disableBulkEdit: true,
      },

      fields: [
        {
          type: 'row',
          fields: [
            {
              type: 'text',
              name: 'en',
              label: 'English',
              required: true,
              admin: {
                width: '50%',
                disableListFilter: true,
                disableListColumn: true,
                disableGroupBy: true,
                disableBulkEdit: true,
              },
              hooks: {
                beforeValidate: [
                  createFallbackToSiblingLocale('de'),
                ],
              },
            },
            {
              type: 'text',
              name: 'de',
              label: 'German',
              required: true,
              admin: {
                width: '50%',
                disableListFilter: true,
                disableListColumn: true,
                disableGroupBy: true,
                disableBulkEdit: true,
              },
              hooks: {
                beforeValidate: [
                  createFallbackToSiblingLocale('en'),
                ],
              },
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'caption',
      label: 'Caption',
      admin: {
        hideGutter: true,
        disableListFilter: false,
        disableListColumn: false,
        disableGroupBy: true,
        disableBulkEdit: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              type: 'text',
              name: 'en',
              label: 'English',
              admin: {
                width: '50%',
                disableListFilter: false,
                disableListColumn: false,
                disableGroupBy: true,
                disableBulkEdit: true,
              },
              defaultValue: '',
            },
            {
              type: 'text',
              name: 'de',
              label: 'German',
              admin: {
                width: '50%',
                disableListFilter: true,
                disableListColumn: true,
                disableGroupBy: true,
                disableBulkEdit: true,
              },
              defaultValue: '',
            },
          ],
        },
      ],
    },

    /* -------------- Virtual Fields -------------- */
    {
      type: 'text',
      name: 'name_label',
      label: 'Name',
      virtual: 'name.en',
      admin: {
        hidden: true,
        readOnly: true,
        disableListFilter: false,
        disableListColumn: false,
        disableGroupBy: true,
        disableBulkEdit: true,
      },
    },
    {
      type: 'text',
      name: 'caption_label',
      label: 'Caption',
      virtual: 'caption.en',
      admin: {
        hidden: true,
        readOnly: true,
        disableListFilter: false,
        disableListColumn: false,
        disableGroupBy: true,
        disableBulkEdit: true,
      },
    },
    // {
    //   name: 'skilledJobs',
    //   type: 'join',
    //   collection: CollectionSlug['ResumeJobs'],
    //   on: 'skills',
    //   hasMany: true,
    //   virtual: true,
    //   admin: {
    //     allowCreate: false,
    //     disableGroupBy: true,
    //     disableListColumn: true,
    //     disableListFilter: true,
    //   },
    // },

    /* -------------- Sidebar Content -------------- */
    {
      type: 'checkbox',
      name: 'published',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'type',
      type: 'select',
      interfaceName: 'SkillType',
      options: Object.values(SKILL_TYPE).map((skillType) => ({
        label: translate('en', `skill.type.${skillType}`),
        value: skillType,
      })),
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'relationship',
      name: 'skillTags',
      relationTo: [
        CollectionSlug.ResumeSkillTags,
      ],
      hasMany: true,
      admin: {
        appearance: 'select',
        position: 'sidebar',
        allowCreate: true,
        allowEdit: true,
        isSortable: true,
      },
    },

    // {
    //   name: 'experienceInterval',
    //   label: 'Experience (months)',
    //   type: 'number',
    //   virtual: true,
    //   defaultValue: 0,
    //   admin: {
    //     readOnly: true,
    //     position: 'sidebar',
    //   },
    //   hooks: {
    //     afterRead: [
    //       async ({ req, originalDoc }) => {
    //         const { docs: skilledJobs = [] } = await req.payload.find({
    //           collection: CollectionSlug['ResumeJobs'],
    //           depth: 1,
    //           where: {
    //             and: [
    //               {
    //                 skills: {
    //                   contains: originalDoc.id,
    //                 },
    //               },
    //               {
    //                 _status: {
    //                   equals: 'published',
    //                 },
    //               },
    //             ],
    //           },
    //           select: {
    //             employmentInterval: true,
    //           },
    //           pagination: false,
    //           req,
    //         })
    //
    //         const interval: number = skilledJobs.reduce(
    //           (acc: number, job: ResumeJobData) => acc + job.employmentInterval,
    //           0,
    //         )
    //
    //         return interval
    //       },
    //     ],
    //   },
    // },
  ],
  trash: true,
  versions: false,
}
