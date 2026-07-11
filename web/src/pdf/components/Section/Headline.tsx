import { StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ExpandedBookmark } from '@react-pdf/types'
import type { Merge } from 'type-fest'

import { colors, sizes, textStyles } from '@pdf/constants'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: '0.3cm',
    width: sizes.documentInnerWidth,
  },
  line: {
    flexGrow: 1,
    marginTop: 4,
    height: 1.5,
    backgroundColor: colors.textHeadline,
  },
})

interface HeadlineProps {
  children: string
  withoutLine?: boolean
  bookmark?:
    | string
    | Merge<
        ExpandedBookmark,
        {
          parent?: number
        }
      >
}

export const Headline = ({ children, withoutLine, bookmark }: HeadlineProps) => (
  <View style={styles.container}>
    <Text
      style={textStyles.headline}
      {...{
        bookmark,
      }}
    >
      {children}
    </Text>
    {!withoutLine && <View style={styles.line} />}
  </View>
)
