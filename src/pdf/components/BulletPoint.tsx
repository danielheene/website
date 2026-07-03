import { colors, textStyles } from '@pdf/constants'
import { StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

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
  },
})

interface BulletPointProps {
  children: ReactNode
}

export const BulletPoint = ({ children }: BulletPointProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.bullet} />
      <Text
        style={[
          styles.text,
          textStyles.bulletPoint,
        ]}
      >
        {children}
      </Text>
    </View>
  )
}
