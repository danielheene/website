import type { FieldHook } from 'payload'

import { fetchAnthropicMetaDescription } from '@/lib/fetchAnthropicMetaDescription'
import { generateContentURL } from '@/lib/generateContentURL'

export const generateMetaDescriptionHook =
  (slugPath: string): FieldHook =>
  async ({ data, operation, value, collection }) => {
    if (operation === 'create' || typeof value !== 'string' || value === '') {
      const slugValue = data?.[slugPath]

      if (typeof slugValue === 'string' && slugValue.length > 0) {
        const url = generateContentURL({
          collection: collection.slug,
          slug: slugValue,
        })

        return await fetchAnthropicMetaDescription(url)
      }
    }

    return value
  }
