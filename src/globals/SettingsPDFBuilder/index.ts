import { AdminGroup } from '@custom-types'
import dedent from 'dedent'
import { revalidateTag } from 'next/cache'
import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { OrderableField } from '@/fields/Orderable'
import { translate } from '@/lib/i18n'
import { GlobalSlug } from '@/types/globals'
import { SKILL_TYPE } from '@/types/select-options'

export const SettingsPDFBuilder: GlobalConfig<GlobalSlug.SettingsPDFBuilder> = {
  slug: GlobalSlug.SettingsPDFBuilder,
  label: 'PDF Builder',
  access: {
    read: authenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      async ({ doc, context }) => {
        if (!context.skipRevalidate) {
          revalidateTag(GlobalSlug.SettingsPDFBuilder)
        }
        return doc
      },
    ],
  },
  admin: {
    group: AdminGroup.Settings,
  },
  typescript: {
    interface: 'PDFBuilderSettings',
  },
  fields: [
    {
      name: 'fileName',
      type: 'text',
      defaultValue: 'resume',
    },

    OrderableField({
      name: 'skillTypeOrder',
      label: 'Skill Type Order',
      description: dedent`
          Order the skill types in the generated document.
        `,
      options: Object.values(SKILL_TYPE).map((skillType) => ({
        label: translate('en', `skill.type.${skillType}`),
        value: skillType,
      })),
    }),
  ],
}
