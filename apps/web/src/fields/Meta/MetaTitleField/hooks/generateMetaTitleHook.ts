import type { FieldHook } from 'payload'

import { generateMetaTitle } from '@/lib/generateMetaTitle'

export const generateMetaTitleHook =
  (titlePath: string): FieldHook =>
  async ({ data, operation, value,  }) => {
    if (operation === 'create' || typeof value !== 'string' || value === '') {
      const fieldData = data?.[titlePath]

      if (typeof fieldData === 'string' && fieldData.length > 0) {
        return await generateMetaTitle(fieldData)
      }
    }

    return value
  }
