import { View, StyleSheet, Text } from '@react-pdf/renderer'
import { ReactNode } from 'react'
import { colors } from '@/pdfs/colors'
import { registerFonts } from '@/pdfs/fonts'

const { PPSupplyMono } = registerFonts(['PPSupplyMono'])

const styles = StyleSheet.create({
  section: {
    flexDirection: 'column',
    flexShrink: 1,
    flexGrow: 1,
    maxWidth: '100%',
    rowGap: '0.75cm',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: '0.3cm',
  },
  title: {
    fontFamily: PPSupplyMono,
    fontSize: '16pt',
    color: colors.primary,
  },
  line: {
    flexGrow: 1,
    marginTop: '4pt',
    height: '1.5pt',
    backgroundColor: colors.primary,
  },
})

interface SectionProps {
  children: ReactNode
  title: string
}

export const Section = ({ title, children }: SectionProps) => (
  <View style={styles.section}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.line} />
    </View>
    {children}
  </View>
)
