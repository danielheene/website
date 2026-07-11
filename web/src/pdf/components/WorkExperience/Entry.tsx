import { StyleSheet, View } from '@react-pdf/renderer'
import { ReactNode } from 'react'

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
