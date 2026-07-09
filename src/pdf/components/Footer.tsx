import type { JSX } from 'react'
import { Link, StyleSheet, type Styles, Text, View } from '@react-pdf/renderer'

import { textStyles } from '@pdf/constants'
import { DocumentFooter } from '@pdf/types'

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
})

type DocumentFooterProps = {
  fixed?: boolean
  style?: Styles[string]
} & DocumentFooter

export const Footer = ({
  renderPagination,
  generatedNotice,
  generatedNoticeUrl,
  fixed,
  style: styleFromProp = {},
}: DocumentFooterProps): JSX.Element => (
  <View
    style={[
      style.container,
      styleFromProp,
    ]}
    fixed={fixed}
  >
    <Link style={textStyles.footerNote} src={generatedNoticeUrl}>
      {generatedNotice}
    </Link>
    <Text
      style={textStyles.footerPagination}
      render={({ pageNumber, totalPages }) =>
        renderPagination(String(pageNumber), String(totalPages))
      }
    />
  </View>
)
