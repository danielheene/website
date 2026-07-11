import { Text } from '@react-pdf/renderer'

import { BulletPoint } from '@pdf/components/BulletPoint'
import { textStyles } from '@pdf/constants'

export const SkillEntry = ({ name, caption }: { name: string; caption?: string }) => (
  <BulletPoint>
    <Text style={caption && textStyles.skillNameWithCaption}>{name}</Text>
    {caption && <Text>{'\u0020' + caption}</Text>}
  </BulletPoint>
)
