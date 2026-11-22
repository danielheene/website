import { extractDocumentText } from '@/lib/extractDocumentText'

type WithContent =
  | {
      content?: unknown
    }
  | null
  | undefined

/** Whether the text of a post's content differs from the previous version; formatting alone doesn't count. */
export const contentTextChanged = (doc: WithContent, previousDoc: WithContent): boolean =>
  extractDocumentText(doc?.content) !== extractDocumentText(previousDoc?.content)
