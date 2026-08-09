import { ReactNode } from 'react'
import { Text } from '@react-pdf/renderer'

import { textStyles } from '@/pdf/constants'

export const Introduction = ({ children }: { children: ReactNode }) => (
  <Text style={textStyles.introduction}>{children}</Text>
)
