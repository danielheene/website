import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from '@react-pdf/renderer'

import { colors, textStyles } from '@/pdf/constants'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginLeft: 10,
  },
  bullet: {
    width: 3.5,
    height: 3.5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    top: 5,
    left: -8,
    position: 'absolute',
  },
  text: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '50%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
})

interface BulletPointProps {
  children: ReactNode
}

export const BulletPoint = ({ children }: BulletPointProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.bullet} />
      <View
        style={[
          styles.text,
          // textStyles.bulletPoint,
        ]}
      >
        <Text style={textStyles.bulletPoint}>{children}</Text>
      </View>
    </View>
  )
}
