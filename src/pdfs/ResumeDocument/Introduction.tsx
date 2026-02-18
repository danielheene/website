import type { UserMetaData } from '@payload-types'
import { StyleSheet, Text, View } from '@react-pdf/renderer'

import { colors } from '../colors'
import { registerFonts } from '../fonts'

interface IntroductionProps extends UserMetaData {
  locale?: string
}

const { PPFramerText, PPSupplyMono } = registerFonts(['PPSupplyMono', 'PPFramerText'])

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: '0.5cm',
    marginBottom: '1.5cm',
  },
  headline: {
    color: colors.primary,
    fontFamily: PPSupplyMono,
    fontSize: '16pt',
    lineHeight: '16pt',
  },
  description: {
    color: colors.gray,
    fontFamily: PPFramerText,
    fontSize: '12pt',
    lineHeight: '16pt',
  },
})

export const Introduction = ({ name, jobTitle, description }: IntroductionProps) => {
  const headline = `${name}, ${jobTitle}`

  return (
    <View style={styles.container}>
      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  )
}
