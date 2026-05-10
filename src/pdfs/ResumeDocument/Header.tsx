import { Image, Link, StyleSheet, Text, View } from '@react-pdf/renderer'
import parsePhoneNumber from 'libphonenumber-js'

import type { DeepReduced } from '@/lib/reduceDataToLocale'
import { isMediaImage } from '@/lib/typeGuards'
import { registerFonts } from '@/pdfs/fonts'
import type { UserConfigurationData } from '@/types/payload'

import { colors } from '../colors'

interface HeaderProps extends DeepReduced<UserConfigurationData> {
  locale?: string
}

const { PPSupplyMono } = registerFonts([
  'PPSupplyMono',
])

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

export const Header = ({
  portrait,
  telephone,
  email,
  url,
  sameAs,
  address,
  locale,
}: HeaderProps) => {
  const imageUrl = isMediaImage(portrait.regular)
    ? portrait.regular.url
    : undefined

  const phone = parsePhoneNumber(telephone)
  const github = sameAs?.find(({ url }) => url.includes('github'))?.url

  return (
    <View style={styles.container} fixed>
      {imageUrl && <Image src={imageUrl} style={styles.portrait} />}
      <View style={styles.column}>
        <Text style={styles.text}>{`${address.street} ${address.number}`}</Text>
        <Text
          style={styles.text}
        >{`${address.postCode} ${address.place}`}</Text>
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
          {url?.replace(/^https?:\/\//, '')}
        </Link>
        {github && (
          <Link style={styles.text} href={github}>
            {github?.replace(/^https?:\/\//, '')}
          </Link>
        )}
      </View>
    </View>
  )
}
