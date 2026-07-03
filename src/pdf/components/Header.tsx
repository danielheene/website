import { Image, Link, StyleSheet, type Styles, Text, View } from '@react-pdf/renderer'

import type { JSX } from 'react'

import { mmToPt, textStyles } from '@pdf/constants'
import { DocumentHeaderData } from '@pdf/lib/buildDocumentHeader'

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: mmToPt(10),
  },
  portrait: {
    width: mmToPt(15),
    height: mmToPt(15),
    borderRadius: mmToPt(15),
    marginRight: 'auto',
  },
  column: {
    alignSelf: 'center',
    justifySelf: 'flex-end',
    flexDirection: 'column',
  },
})

type DocumentHeaderProps = {
  fixed?: boolean
  style?: Styles[string]
} & DocumentHeaderData

export const DocumentHeader = ({
  portraitUrl,
  address,
  telephone,
  email,
  website,
  github,
  fixed,
  style: styleFromProp = {},
}: DocumentHeaderProps): JSX.Element => (
  <View
    style={[
      style.container,
      styleFromProp,
    ]}
    fixed={fixed}
  >
    <Image src={portraitUrl} style={style.portrait} />
    <View style={style.column}>
      <Text style={textStyles.header}>{address.street}</Text>
      <Text style={textStyles.header}>{address.city}</Text>
    </View>
    <View style={style.column}>
      <Link style={textStyles.header} href={telephone.href}>
        {telephone.label}
      </Link>
      <Link style={textStyles.header} href={email.href}>
        {email.label}
      </Link>
    </View>
    <View style={style.column}>
      <Link style={textStyles.header} href={website.href}>
        {website.label}
      </Link>
      <Link style={textStyles.header} href={github.href}>
        {github.label}
      </Link>
    </View>
  </View>
)
