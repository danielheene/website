import { generateSlug } from '@/utilities/generateSlug'
import type { FieldHook } from 'payload'

export const generateSlugHook =
  (fieldToUse: string): FieldHook =>
  ({ data, operation, value }) => {
    if (operation === 'create' || typeof value !== 'string' || value === '') {
      const fieldData = data?.[fieldToUse]

      if (typeof fieldData === 'string' && fieldData.length > 0) {
        return generateSlug(fieldData)
      }
    }

    return value
  }
