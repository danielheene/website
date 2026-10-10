import type { FieldHook } from 'payload'

import { get } from 'lodash-es'

import { generateSlug } from '@/lib/generateSlug'

/**
 * Generates a slug from the specified source field if no slug is set.
 *
 * Runs only on published documents to prevent premature slug generation
 * during drafts, avoiding unnecessary URL changes and redirects.
 */
export const generateSlugHook =
  (fieldToUse: string): FieldHook =>
  ({ data, operation, value }) => {
    const isPublished = ['create', 'update'].includes(operation) && data?._status === 'published'
    const hasSlugValue = typeof value === 'string' && value?.trim() !== ''

    if (isPublished && !hasSlugValue) {
      const fieldData = get(data, fieldToUse)

      if (typeof fieldData === 'string' && fieldData.length > 0) {
        return generateSlug(fieldData)
      }
    }

    return value
  }
