import { textStyles } from '@pdf/constants'
import { Text } from '@react-pdf/renderer'
import { ReactNode } from 'react'

export const Introduction = ({ children }: { children: ReactNode }) => (
  <Text style={textStyles.introduction}>{children}</Text>
)
