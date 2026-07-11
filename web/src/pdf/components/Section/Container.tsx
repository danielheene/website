import { StyleSheet, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

import { sizes } from '@pdf/constants'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    width: sizes.documentInnerWidth,
    rowGap: 7,
  },
})

interface ContainerProps {
  wrap?: boolean
  children: ReactNode
}

export const Container = ({ wrap = true, children }: ContainerProps) => (
  <View style={styles.container} wrap={wrap}>
    {children}
  </View>
)
