import type { GlobalConfig } from 'payload'

import dedent from 'dedent'

import { authenticated } from '@/access/authenticated'
import { DurationField } from '@/fields/Duration'
import { TemplateField } from '@/fields/Template'
import { translate } from '@/lib/i18n'
import { nanoid } from '@/lib/nanoid'
import { AdminGroup } from '@/types/admin-panel'
import { GlobalSlug } from '@/types/globals'
import { SkillSorting, SkillType, SkillTypeSortable } from '@/types/payload'
import { SKILL_TYPE } from '@/types/select-options'

import { sanitizeSkillSorting } from './hooks/sanitizeSkillSorting'
import { updateCachedData } from './hooks/updateCachedData'

const sharedId = nanoid(32)

export const skillSortingKeys: (keyof SkillSorting & string)[] = [
  'skillTypeSortable',
  ...(Object.values(SKILL_TYPE) as SkillType[]),
]

export const skillTypeSortables = Object.values(SKILL_TYPE).map((skillType) => ({
  id: skillType,
  label: translate('en', `skill.type.${skillType}`),
})) as SkillTypeSortable[]

export const PDFGeneratorSettings: GlobalConfig<GlobalSlug['PDFGeneratorSettings']> = {
  slug: GlobalSlug.PDFGeneratorSettings,
  label: 'PDF Builder',
  access: {
    read: authenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      updateCachedData,
    ],
  },
  admin: {
    group: AdminGroup.Settings,
    components: {
      elements: {
        beforeDocumentControls: [
          '@/globals/PDFGeneratorSettings/components/GenerateButton',
        ],
      },
    },
  },
  typescript: {
    interface: 'PDFGeneratorSettings',
  },
  fields: [
    {
      type: 'group',
      admin: {
        hideGutter: true,
      },
      fields: [
        TemplateField({
          name: 'documentTitleTemplate',
          label: 'Document Title Template',
          description: dedent`
            The document name template for the documents collection.
            The document contains all meta data, file references and the data which was used to generate the PDFs.
          `,
          data: {
            nanoid: sharedId,
          },
          renderLocale: [
            'en',
          ],
        }),
      ],
    },
    {
      type: 'group',
      admin: {
        hideGutter: true,
      },
      fields: [
        TemplateField({
          name: 'filenameTemplate',
          label: 'Filename Template',
          description: dedent`
            The filename template for the generated PDF which must satisfy both locales and result in two different filenames.
            To get an full overview of all available variables or filter functions use the info icon.
          `,
          data: {
            nanoid: sharedId,
          },
          renderLocale: [
            'en',
            'de',
          ],
        }),
      ],
    },
    {
      type: 'group',
      label: 'Queue Handling',
      admin: {
        hideGutter: true,
        description: dedent`
          __Generate Throttle:__ Time to wait between the last change and the next scheduled PDF generation. This prevents multiple scheduled Jobs during a set of changes.${'  '}
          __Timeout Between Jobs:__ Time to wait between the last scheduled Job and the next scheduled Job. This prevents too many generated PDFs over the time of a day.${'  '}
          __Maximum Attempts:__ Number of attempts before a scheduled Job is marked as failed. To avoid hard failures due to flaky network connections or server issues.${'  '}
        `,
        components: {
          Description: '@/components/AdminPanel#MarkdownDescription',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            DurationField({
              name: 'generateThrottle',
              label: 'Generate Throttle',
              width: '33.3%',
            }),
            DurationField({
              name: 'timeoutBetweenJobs',
              label: 'Timeout Between Jobs',
              width: '33.3%',
            }),
            {
              type: 'number',
              name: 'maximumRetries',
              label: 'Maximum Retries',
            },
          ],
        },
        {
          type: 'row',
          fields: [],
        },
      ],
    },

    {
      type: 'group',
      label: 'Skill Type Sorting',
      admin: {
        hideGutter: true,
        description: dedent`
          Order the skill types in the generated document.
        `,
        components: {
          Description: '@/components/AdminPanel#MarkdownDescription',
        },
      },
      fields: [
        {
          name: 'skillSorting',

          label: false,
          type: 'json',

          typescriptSchema: [
            () => ({
              title: 'SkillSorting',
              type: 'object',
              properties: {
                ...skillSortingKeys.reduce((acc, key) => {
                  acc[key] = {
                    type: 'array',
                    items: {
                      $ref:
                        key === 'skillTypeSortable'
                          ? '#/definitions/SkillTypeSortable'
                          : '#/definitions/SkillEntrySortable',
                    },
                  }

                  return acc
                }, {}),
              },
              additionalProperties: false,
              required: skillSortingKeys,
            }),
          ],
          hooks: {
            afterRead: [
              sanitizeSkillSorting,
            ],
          },
          admin: {
            components: {
              Field: '@/globals/PDFGeneratorSettings/components/SkillSortingField',
            },
          },
        },
      ],
    },
  ],
  versions: false,
}
