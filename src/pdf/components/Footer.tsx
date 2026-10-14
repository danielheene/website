import { Link, StyleSheet, type Styles, Text, View } from '@react-pdf/renderer'
import type { JSX } from 'react'

import { type BilingualLanguage, translate } from '@/lib/i18n'
import { textStyles } from '@/pdf/constants'

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
})

type DocumentFooterProps = {
  locale: BilingualLanguage
  documentUrl: string
  fixed?: boolean
  style?: Styles[string]
}

export const Footer = ({
  locale,
  documentUrl,
  fixed,
  style: styleFromProp = {},
}: DocumentFooterProps): JSX.Element => (
  <View style={[style.container, styleFromProp]} fixed={fixed}>
    <Link style={textStyles.footerNote} src={documentUrl}>
      {translate(locale, 'document.footer.generatedNotice', { documentUrl })}
    </Link>
    <Text
      style={textStyles.footerPagination}
      render={({ pageNumber, totalPages }) =>
        translate(locale, 'document.footer.pagination', {
          pageNumber: String(pageNumber),
          totalPages: String(totalPages),
        })
      }
    />
  </View>
)
