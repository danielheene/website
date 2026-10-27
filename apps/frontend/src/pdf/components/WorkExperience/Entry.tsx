import { StyleSheet, Styles, View } from '@react-pdf/renderer'
import { ReactNode } from 'react'

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
  },
})

export const Entry = ({
  children,
  style = {},
}: {
  children: ReactNode
  style?: Styles[string]
}) => (
  <View
    style={{
      ...styles.container,
      ...style,
    }}
    wrap={false}
  >
    {children}
  </View>
)
