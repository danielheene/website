import { get } from 'lodash-es'
import type { FieldHook } from 'payload'

import { generateSlug } from '@repo/utils/generateSlug'

export const generateSlugHook =
  (fieldToUse: string): FieldHook =>
  ({ data, operation, value }) => {
    if (
      operation === 'create' &&
      (typeof value !== 'string' || value?.trim() === '')
    ) {
      const fieldData = get(data, fieldToUse)

      if (typeof fieldData === 'string' && fieldData.length > 0) {
        return generateSlug(fieldData)
      }
    }

    return value
  }
