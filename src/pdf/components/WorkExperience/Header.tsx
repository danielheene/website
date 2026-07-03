import { StyleSheet, Text, View } from '@react-pdf/renderer'

import { sizes, textStyles } from '@pdf/constants'
import { Bookmark } from '@pdf/types'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 4,
  },
  interval: {
    width: sizes.columnLeftWidth,
  },
  title: {
    width: sizes.columnRightWidth,
  },
})

export const Header = ({
  title,
  interval,
  bookmark,
}: {
  title: string
  interval: string
  bookmark?: Bookmark
}) => (
  <View style={styles.container}>
    <Text
      style={[
        styles.interval,
        textStyles.jobInterval,
      ]}
    >
      {interval}
    </Text>
    <Text
      style={[
        styles.title,
        textStyles.jobTitle,
      ]}
      {...{
        bookmark,
      }}
    >
      {title}
    </Text>
  </View>
)
