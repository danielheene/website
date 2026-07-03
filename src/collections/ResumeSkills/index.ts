import { AdminGroup } from '@custom-types'
import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { SlugField } from '@/fields/Slug'
import { createFallbackToSiblingLocale } from '@/lib/hooks/createFallbackToSiblingLocale'
import { enqueueGenerateResumeDocuments } from '@/lib/hooks/enqueueGenerateResumeDocuments'
import { revalidateResumeSectionCollectionHook } from '@/lib/hooks/revalidateResumeSection'
import { translate } from '@/lib/i18n'
import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'
import type { ResumeJobData } from '@/types/payload'
import { SKILL_TYPE } from '@/types/select-options'

export const ResumeSkills: CollectionConfig<CollectionSlug.ResumeSkills> = {
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
    useAsTitle: 'title',
    group: AdminGroup.Resume,
    groupBy: true,
    defaultColumns: [
      'name.en',
      'slug',
      'type',
    ],
    disableCopyToLocale: true,
  },

  orderable: true,
  // defaultPopulate: {
  //   name: {
  //     en: true,
  //     de: true,
  //   },
  //   slug: true,
  //   type: true,
  //   experienceInterval: true,
  // },
  disableDuplicate: true,
  forceSelect: {
    name: {
      en: true,
      de: true,
    },
    slug: true,
    type: true,
  },
  fields: [
    {
      type: 'group',
      name: 'name',
      label: 'Name',
      admin: {
        hideGutter: true,
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
              },
              defaultValue: '',
            },
            {
              type: 'text',
              name: 'de',
              label: 'German',
              admin: {
                width: '50%',
              },
              defaultValue: '',
            },
          ],
        },
      ],
    },
    {
      type: 'text',
      name: 'title',
      virtual: 'name.en',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'skilledJobs',
      type: 'join',
      collection: CollectionSlug.ResumeJobs,
      on: 'skills',
      hasMany: true,
      virtual: true,
      admin: {
        allowCreate: false,
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    SlugField({
      fieldToUse: 'name.en',
    }),
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
      name: 'experienceInterval',
      label: 'Experience (months)',
      type: 'number',
      virtual: true,
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      hooks: {
        afterRead: [
          async ({ req, originalDoc }) => {
            const { docs: skilledJobs = [] } = await req.payload.find({
              collection: CollectionSlug.ResumeJobs,
              depth: 1,
              where: {
                and: [
                  {
                    skills: {
                      contains: originalDoc.id,
                    },
                  },
                  {
                    _status: {
                      equals: 'published',
                    },
                  },
                ],
              },
              select: {
                employmentInterval: true,
              },
              pagination: false,
              req,
            })

            const interval: number = skilledJobs.reduce(
              (acc: number, job: ResumeJobData) => acc + job.employmentInterval,
              0,
            )

            return interval
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
