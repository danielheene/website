import type { CollectionConfig } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

import { truncate } from 'lodash-es'

import { authenticated } from '@/access/authenticated'
import { BilingualRichTextField } from '@/fields/BilingualRichText'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { generateResumeDocumentHook } from '@/lib/hooks/collection'
import { translate } from '@/lib/i18n'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'
import { SKILL_TYPE } from '@/types/select-options'

export const ResumeSkills: CollectionConfig<CollectionSlug['ResumeSkills']> = {
  slug: CollectionSlug.ResumeSkills,
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
    useAsTitle: 'title',
    group: AdminGroup.Resume,
    groupBy: true,
    defaultColumns: [
      'title',
      'type',
    ],
    disableCopyToLocale: true,
  },
  // defaultPopulate: {
  //   content: {
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
    content: true,
    type: true,
  },
  fields: [
    /* -------------- Main  Content -------------- */
    BilingualRichTextField({
      name: 'content',
      label: 'Content',
      editorVariant: 'inline',

      layout: 'row',
      required: true,
    }),

    /* -------------- Virtual Fields -------------- */
    {
      type: 'text',
      name: 'title',
      label: 'Content',
      // virtual: true,
      admin: {
        hidden: true,
        readOnly: true,
        disableListFilter: false,
        disableListColumn: false,
        disableGroupBy: true,
        disableBulkEdit: true,
      },
      hooks: {
        afterRead: [
          ({ siblingData }) => {
            const content = (
              siblingData as
                | {
                    content?: {
                      en?: SerializedEditorState
                    }
                  }
                | undefined
            )?.content?.en
            if (!content) return ''
            const textValue = convertLexicalToPlaintext({
              data: content,
            }).trim()

            return truncate(textValue, {
              length: 35,
            })
          },
        ],
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

    GeneratorFlagsField(),
  ],
  trash: true,
  versions: false,
}
