import type { CollectionBeforeChangeHook } from 'payload'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

import type { BlogPostData } from '@/types/payload'

const WORDS_PER_MINUTE = 238

export const generateReadingTime: CollectionBeforeChangeHook<BlogPostData> = async ({ data }) => {
  const html = convertLexicalToHTML({
    data: data.content,
    disableContainer: true,
  })

  const words = html
    .replace(/<[^>]*>/g, ' ') // replace html tags with spaces
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  const readingTime =
    words.length === 0 ? 0 : Math.max(1, Math.ceil(words.length / WORDS_PER_MINUTE))

  return {
    ...data,
    readingTime,
  }
}
