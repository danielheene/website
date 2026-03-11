import type { UserMetaData } from '@payload-types'
import { Image, Link, StyleSheet, Text, View } from '@react-pdf/renderer'
import parsePhoneNumber from 'libphonenumber-js'

import { isMediaImage } from '@/lib/typeGuards'
import { registerFonts } from '@/pdfs/fonts'

import { colors } from '../colors'

interface HeaderProps extends UserMetaData {
  locale?: string
}

const { PPSupplyMono } = registerFonts(['PPSupplyMono'])

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '1cm',
    marginBottom: '1.5cm',
  },
  portrait: {
    width: '1cm',
    height: '1cm',
    borderRadius: '1cm',
    marginRight: 'auto',
  },
  column: {
    justifySelf: 'flex-end',
    flexDirection: 'column',
    fontSize: '10pt',
    lineHeight: '16pt',
    fontFamily: PPSupplyMono,
    letterSpacing: '-0.3pt',
  },
  text: {
    textDecoration: 'none',
    color: colors.lightGray,
  },
})

export const Header = ({ image, telephone, email, url, github, address }: HeaderProps) => {
  const portraitUrl = isMediaImage(image) ? image.url : undefined
  const phone = parsePhoneNumber(telephone)

  return (
    <View style={styles.container} fixed>
      {portraitUrl && <Image src={portraitUrl} style={styles.portrait} />}
      <View style={styles.column}>
        <Text style={styles.text}>{`${address.street} ${address.number}`}</Text>
        <Text style={styles.text}>{`${address.postCode} ${address.place}`}</Text>
      </View>
      <View style={styles.column}>
        <Link style={styles.text} href={phone.getURI()}>
          {phone.formatInternational()}
        </Link>
        <Link style={styles.text} href={`mailto:${email}`}>
          {email}
        </Link>
      </View>
      <View style={styles.column}>
        <Link style={styles.text} href={url}>
          {url.replace(/^https?:\/\//, '')}
        </Link>
        <Link style={styles.text} href={github}>
          {github.replace(/^https?:\/\//, '')}
        </Link>
      </View>
    </View>
  )
}
