import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { JobHistoryField } from '@/fields/JobHistory'
import { RichTextField } from '@/fields/RichText'
import { TitleField } from '@/fields/Title'
import { revalidateResumeSection } from '@/utilities/revalidateResumeSection'
import { AdminGroup, GlobalSlug } from '@custom-types'
import { GlobalConfig } from 'payload'
import { calculateSkillSummary } from './hooks/calculateSkillSummary'

export const ResumeExperience: GlobalConfig<GlobalSlug.ResumeExperience> = {
  slug: GlobalSlug.ResumeExperience,
  label: 'Experience',
  access: {
    read: authenticatedOrPublished,
    update: authenticated,
  },
  hooks: {
    afterChange: [calculateSkillSummary, revalidateResumeSection(GlobalSlug.ResumeExperience)],
  },
  admin: {
    group: AdminGroup.Resume,
  },
  typescript: { interface: 'ResumeExperienceGlobalData' },
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
          fields: [JobHistoryField()],
        },
      ],
    },
    {
      name: 'skillSummary',
      label: 'Skill Summary',
      defaultValue: {},
      jsonSchema: {
        uri: 'a://b/foo.json', // required
        fileMatch: ['a://b/foo.json'], // required
        schema: {
          type: 'object',
          patternProperties: {
            '^[A-Za-z0-9_-]+$': {
              type: 'object',
              properties: {
                label: { type: 'string' },
                time: { type: 'number' },
              },
              additionalProperties: false,
              required: ['label', 'time'],
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
  versions: {
    drafts: {
      autosave: false,
      schedulePublish: false,
      localizeStatus: true,
    },
  },
}
