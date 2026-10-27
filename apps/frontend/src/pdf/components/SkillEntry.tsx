import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { BulletPoint } from '@/pdf/components/BulletPoint'
import { lexicalToJSX } from '@/pdf/lib/lexicalToJSX'

export const SkillEntry = ({ content }: { content: SerializedEditorState }) => (
  <BulletPoint>{lexicalToJSX(content)}</BulletPoint>
)
