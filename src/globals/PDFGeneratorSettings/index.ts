import type { GlobalConfig } from 'payload'

import { hoursToMilliseconds, minutesToMilliseconds } from 'date-fns'
import dedent from 'dedent'

import { authenticated } from '@/access/authenticated'
import { DurationField } from '@/fields/Duration'
import { SectionGroupField } from '@/fields/SectionGroup'
import { TemplateField } from '@/fields/Template'
import { generateResumeDocumentHook } from '@/lib/hooks/global'
import { translate } from '@/lib/i18n'
import { nanoid } from '@/lib/nanoid'
import { AdminGroup } from '@/types/admin-panel'
import { GlobalSlug } from '@/types/globals'
import { SkillSorting, SkillType, SkillTypeSortable } from '@/types/payload'
import { SKILL_TYPE } from '@/types/select-options'

import { revalidateDocument } from './hooks/revalidateDocument'
import { sanitizeSkillSorting } from './hooks/sanitizeSkillSorting'

const previewCustomId = nanoid(8)

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
      revalidateDocument,
      generateResumeDocumentHook,
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
          description: `
            The document name template for the documents collection.
            The document contains all meta data, file references and the data which was used to generate the PDFs.
          `,
          // Without a default, this is empty on a fresh database — every
          // settings-global save enqueues a PDF-generation job
          // (generateResumeDocumentHook) that feeds this straight into
          // renderTemplate, so an empty template is a real, immediate
          // failure mode rather than a rendering nicety.
          defaultValue: 'Resume {customId}',
          overrides: {
            required: true,
          },
          data: {
            customId: previewCustomId,
          },
          anntotation: {
            label: 'Custom Data',
            entries: {
              '{customId}':
                'Eight uppercase alphanumeric characters which also serve as a unique identifier for the document.',
            },
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
          description: `
            The filename template for the generated PDF which must satisfy both locales and result in two different filenames.
            To get an full overview of all available variables or filter functions use the info icon.
          `,
          // Without a default, this is empty on a fresh database — same
          // failure mode as documentTitleTemplate above. Includes {locale}
          // so the EN/DE outputs stay distinct, matching this field's own
          // "must result in two different filenames" requirement.
          defaultValue:
            '{firstName}{lastName}_Resume_{locale | uppercase}_{date | yyyy}{date | MM}{date | dd}_{customId}',
          overrides: {
            required: true,
          },
          data: {
            customId: previewCustomId,
          },
          anntotation: {
            label: 'Custom Data',
            entries: {
              '{customId}':
                'Eight uppercase alphanumeric characters which also serve as a unique identifier for the document.',
            },
          },
          renderLocale: [
            'en',
            'de',
          ],
        }),
      ],
    },
    SectionGroupField({
      label: 'Queue Handling',
      description: `
        Defines the behavior of the PDF generation queue. How long throttling new jobs to avoid enqueueing too many builds at once, while editing. How long to wait between the last generated PDF and the next scheduled job or the attempts to prevent hard failures due to flaky network connections or server issues.
        `,
      fields: [
        {
          type: 'row',
          fields: [
            DurationField({
              name: 'generateThrottle',
              label: 'Generate Throttle',
              width: '33.3%',
              defaultValue: minutesToMilliseconds(15),
            }),
            DurationField({
              name: 'timeoutBetweenJobs',
              label: 'Timeout Between Jobs',
              width: '33.3%',
              defaultValue: hoursToMilliseconds(4),
            }),
            {
              type: 'number',
              name: 'maximumRetries',
              label: 'Maximum Retries',
              defaultValue: 3,
              required: true,
            },
          ],
        },
      ],
    }),

    SectionGroupField({
      label: 'Skill Type Sorting',
      description: `
          Order the skill types in the generated document.
        `,
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
    }),
  ],
  versions: false,
}
