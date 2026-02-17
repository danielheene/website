import { colors } from '@/pdfs/colors'
import { registerFonts } from '@/pdfs/fonts'
import { WorkExperienceEntry } from '@/pdfs/ResumeDocument/WorkExperienceEntry'
import { ResumeExperienceGlobalData } from '@payload-types'
import { StyleSheet, Text, View } from '@react-pdf/renderer'

interface WorkExperienceProps extends ResumeExperienceGlobalData {
  locale?: string
}

const { PPSupplyMono } = registerFonts(['PPSupplyMono'])

const styles = StyleSheet.create({
  container: {
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

export const WorkExperience = ({ title, jobHistory, locale }: WorkExperienceProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.line} />
      </View>
      {jobHistory.map((job, index) => (
        <WorkExperienceEntry key={index} locale={locale} {...job} />
      ))}
    </View>
  )
}
