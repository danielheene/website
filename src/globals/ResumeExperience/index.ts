import { AdminGroup } from '@custom-types'
import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { JobHistoryField } from '@/fields/JobHistory'
import { RichTextField } from '@/fields/RichText'
import { TitleField } from '@/fields/Title'
import { enqueueGenerateResumeDocuments } from '@/lib/hooks/enqueueGenerateResumeDocuments'
import { revalidateResumeSection } from '@/lib/hooks/revalidateResumeSection'
import { GlobalSlug } from '@/types/globals'

import { calculateSkillSummary } from './hooks/calculateSkillSummary'

export const ResumeExperience: GlobalConfig<GlobalSlug.ResumeExperience> = {
  slug: GlobalSlug.ResumeExperience,
  label: 'Experience',
  access: {
    read: authenticatedOrPublished,
    readVersions: authenticated,
    update: authenticated,
  },
  hooks: {
    beforeChange: [
      calculateSkillSummary,
    ],
    afterChange: [
      revalidateResumeSection(GlobalSlug.ResumeExperience),
      enqueueGenerateResumeDocuments,
    ],
  },
  admin: {
    group: AdminGroup.Resume,
    components: {
      views: {
        edit: {
          skills: {
            Component:
              '@/globals/ResumeExperience/components/ResumeSkillsListTab',
            path: '/skills',
            tab: {
              label: 'Skills',
              href: '/skills',
            },
          },
        },
      },
    },
  },
  typescript: {
    interface: 'ResumeExperienceGlobalData',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Intro',
          fields: [
            TitleField(),
            RichTextField({
              name: 'caption',
              editorVariant: 'inline',
            }),
          ],
        },
        {
          label: 'Job History',
          fields: [
            JobHistoryField(),
          ],
        },
      ],
    },
    {
      name: 'skillSummary',
      label: 'Skill Summary',
      defaultValue: {},
      jsonSchema: {
        uri: 'a://b/foo.json', // required
        fileMatch: [
          'a://b/foo.json',
        ], // required
        schema: {
          type: 'object',
          patternProperties: {
            '^[A-Za-z0-9_-]+$': {
              type: 'object',
              properties: {
                label: {
                  type: 'string',
                },
                time: {
                  type: 'number',
                },
              },
              additionalProperties: false,
              required: [
                'label',
                'time',
              ],
            },
          },
        },
      },
      type: 'json',
      admin: {
        hidden: true,
      },
    },
  ],
  versions: false,
}
