import { CollectionConfig } from 'payload'

import {
  hideVersionsTabForSingleVersion,
  SINGLE_VERSION_DRAFTS,
} from '@/collections/shared/singleVersionDrafts'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { IconField } from '@/fields/Icon'
import { SkillTypeField } from '@/fields/SkillType'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { authenticated } from '@/lib/access/authenticated'
import { authenticatedOrPublished } from '@/lib/access/authenticatedOrPublished'
import { generateResumeDocumentHook } from '@/lib/payloadHooks/collection'
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
  access: {
    read: authenticatedOrPublished,
    update: authenticated,
    create: authenticated,
    delete: authenticated,
    readVersions: authenticated,
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
    pagination: {
      defaultLimit: 50,
      limits: [
        50,
        100,
      ],
    },
    defaultColumns: [
      'title',
      'slug',
      'type',
      'interval',
    ],
    disableCopyToLocale: true,
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
  fields: [
    {
      type: 'row',
      fields: [
        IconField({
          overrides: {
            admin: {
              width: '10%',
            },
          },
        }),
        TitleField({
          overrides: {
            label: 'Title',
            admin: {
              width: '90%',
              components: {
                Cell: '@/collections/ResumeSkillTags/components/TitleCell#TitleCell',
              },
            },
          },
        }),
      ],
    },

    SlugField({
      fieldToUse: 'title',
    }),

    SkillTypeField({
      overrides: {
        admin: {
          position: 'sidebar',
        },
      },
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

    {
      name: 'relatedJobs',
      label: 'Related Jobs',
      type: 'join',
      collection: CollectionSlug.ResumeJobs,
      on: 'skillTags',
      admin: {
        allowCreate: false,
        defaultColumns: [
          'employer',
          'title',
          'startDate',
          'endDate',
        ],
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'relatedSkills',
      label: 'Related Skills',
      type: 'join',
      collection: CollectionSlug.ResumeSkills,
      on: 'skillTags',
      admin: {
        allowCreate: false,
        defaultColumns: [
          'title',
          'type',
        ],
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },

    GeneratorFlagsField(),
  ],
  versions: SINGLE_VERSION_DRAFTS,
}
