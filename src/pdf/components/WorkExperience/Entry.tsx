import { ReactNode } from 'react'
import { StyleSheet, View } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
  },
})

export const Entry = ({ children }: { children: ReactNode }) => (
  <View style={styles.container} wrap={false}>
    {children}
  </View>
)
