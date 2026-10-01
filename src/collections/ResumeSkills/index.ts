import type { CollectionConfig, Field } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

import { truncate } from 'lodash-es'

import { hideVersionsTabForSingleVersion } from '@/collections/shared/singleVersionDrafts'
import { BilingualRichTextField } from '@/fields/BilingualRichText'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { SkillTypeField } from '@/fields/SkillType'
import { authenticated } from '@/lib/access/authenticated'
import { authenticatedOrPublished } from '@/lib/access/authenticatedOrPublished'
import { generateResumeDocumentHook } from '@/lib/payloadHooks/collection'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

import {
  enqueueCalculateSkillTagType,
  enqueueCalculateSkillTagTypeAfterDelete,
} from './hooks/enqueueCalculateSkillTagType'
import { enqueueSyncSkillSorting } from './hooks/enqueueSyncSkillSorting'

/**
 * The list view offers only title, type and status. `id` stays selectable:
 * declaring it would turn it into a custom, editor-supplied ID.
 */
const withoutListColumn = <T extends Field>(field: T): T => ({
  ...field,
  admin: {
    ...field.admin,
    disableListColumn: true,
  },
})

/** Payload's own timestamp fields, which it only adds when a collection doesn't declare them. */
const TIMESTAMP_FIELDS = ['createdAt', 'updatedAt', 'deletedAt'] as const

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
    read: authenticatedOrPublished,
    update: authenticated,
    create: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [enqueueCalculateSkillTagType],
    afterDelete: [enqueueCalculateSkillTagTypeAfterDelete],
    afterOperation: [generateResumeDocumentHook, enqueueSyncSkillSorting],
  },
  admin: {
    useAsTitle: 'title',
    group: AdminGroup.Resume,
    groupBy: true,
    defaultColumns: ['title', 'type', '_status'],
    disableCopyToLocale: true,
    pagination: {
      defaultLimit: 50,
      limits: [50, 100],
    },
    components: {
      views: {
        edit: {
          versions: {
            tab: {
              condition: hideVersionsTabForSingleVersion,
            },
          },
        },
      },
    },
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
  disableBulkEdit: false,
  disableDuplicate: true,
  lockDocuments: false,
  forceSelect: {
    content: true,
    title: true,
    type: true,
  },
  fields: [
    /* -------------- Main  Content -------------- */
    withoutListColumn(
      BilingualRichTextField({
        name: 'content',
        label: 'Content',
        editorVariant: 'inline',

        layout: 'row',
        required: true,
      }),
    ),

    /* -------------- Virtual Fields -------------- */
    {
      type: 'text',
      name: 'title',
      label: 'Title',
      admin: {
        hidden: true,
        readOnly: true,
        components: {
          Cell: '@/collections/ResumeSkills/components/TitleCell#TitleCell',
        },
        disableListFilter: false,
        disableListColumn: false,
        disableGroupBy: true,
        disableBulkEdit: true,
      },
      hooks: {
        afterRead: [
          ({ siblingData, data }) => {
            console.log('data', data?.content)
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

    /* -------------- Sidebar Content -------------- */
    SkillTypeField({
      overrides: {
        admin: {
          position: 'sidebar',
        },
      },
    }),
    {
      type: 'relationship',
      name: 'skillTags',
      relationTo: [CollectionSlug.ResumeSkillTags],
      hasMany: true,
      admin: {
        disableListColumn: true,
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

    withoutListColumn(GeneratorFlagsField()),

    /* ------------ Timestamps (declared only to drop their list columns) ------------ */
    ...TIMESTAMP_FIELDS.map((name): Field => ({
      name,
      type: 'date',
      index: true,
      admin: {
        hidden: true,
        disableBulkEdit: true,
        disableListColumn: true,
      },
    })),
  ],
  trash: true,
  versions: {
    drafts: {
      autosave: false,
      schedulePublish: true,
    },
    maxPerDoc: 1,
  },
}
