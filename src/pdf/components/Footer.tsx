import { textStyles } from '@pdf/constants'
import type { DocumentFooterData } from '@pdf/lib/buildDocumentFooter'
import { StyleSheet, type Styles, Text, View } from '@react-pdf/renderer'
import type { JSX } from 'react'

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
} & DocumentFooterData

export const DocumentFooter = ({
  renderPagination,
  generatedNotice,
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
    <Text style={textStyles.footerNote}>{generatedNotice}</Text>
    <Text style={textStyles.footerPagination} render={renderPagination} />
  </View>
)
