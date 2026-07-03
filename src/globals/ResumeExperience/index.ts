import { AdminGroup } from '@custom-types'
import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { RichTextField } from '@/fields/RichText'
import { TitleField } from '@/fields/Title'
import { enqueueGenerateResumeDocuments } from '@/lib/hooks/enqueueGenerateResumeDocuments'
import { revalidateResumeSectionGlobalHook } from '@/lib/hooks/revalidateResumeSection'
import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'

export const ResumeExperience: GlobalConfig<GlobalSlug.ResumeExperience> = {
  slug: GlobalSlug.ResumeExperience,
  label: 'Experience',
  access: {
    read: authenticatedOrPublished,
    readVersions: authenticated,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      revalidateResumeSectionGlobalHook(GlobalSlug.ResumeExperience),
      enqueueGenerateResumeDocuments,
    ],
  },
  admin: {
    group: AdminGroup.Resume,
    components: {
      views: {
        edit: {
          jobs: {
            Component:
              '@/globals/ResumeExperience/components/ResumeJobsListTab',
            path: '/jobs',
            tab: {
              label: 'Jobs',
              href: '/jobs',
            },
          },
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
            {
              name: 'jobs',
              type: 'relationship',
              relationTo: CollectionSlug.ResumeJobs,
              admin: {
                components: {
                  Field: '@/globals/ResumeExperience/components/JobsList',
                },
              },
              hooks: {
                afterRead: [
                  async ({ data, context, value, req }) => {
                    const { docs: jobs = [] } = await req.payload.find({
                      collection: CollectionSlug.ResumeJobs,
                      sort: '-startDate',
                      pagination: false,
                      select: {
                        title: true,
                        employer: true,
                        startDate: true,
                        endDate: true,
                        skills: true,
                        tasks: true,
                      },
                      where: {
                        _status: {
                          equals: 'published',
                        },
                      },
                      req,
                    })

                    return jobs
                  },
                ],
              },
            },
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
