import { colors } from '@/pdfs/colors'
import { registerFonts } from '@/pdfs/fonts'
import { JobHistory } from '@payload-types'
import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { formatDate } from 'date-fns'

type JobHistoryEntry = JobHistory[number]

interface WorkExperienceEntryProps extends JobHistoryEntry {
  locale: string
}

const { PPSupplyMono, PPFramerText } = registerFonts(['PPSupplyMono', 'PPFramerText'])

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  jobHeader: {
    fontFamily: PPSupplyMono,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  jobInterval: {
    width: '4.5cm',
    fontSize: '10pt',
    color: colors.lightGray,
    fontWeight: 'light',
    paddingTop: '2pt',
    paddingBottom: '1pt',
  },
  jobTitle: {
    width: '14cm',
    fontSize: '12pt',
    color: colors.darkGray,
    fontWeight: 'medium',
  },
  jobItem: {
    fontSize: '10pt',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '14cm',
    marginLeft: '4.5cm',
    fontsFamily: PPFramerText,
    marginTop: '0.15cm',
    lineHeight: '14pt',
  },
  jobItemBullet: {
    color: colors.primary,
    width: '0.3cm',
  },
  jobItemText: {
    color: colors.gray,
    width: '13.7cm',
  },
})

export const WorkExperienceEntry = ({ title, employer, startDate, endDate, content, locale }: WorkExperienceEntryProps) => {
  const timeSpan = endDate
    ? `${formatDate(startDate, 'MM/yyyy')} - ${formatDate(endDate, 'MM/yyyy')}`
    : `${locale === 'de' ? 'Seit' : 'Since'} ${formatDate(startDate, 'MM/yyyy')}`
  const jobTitle = `${title}, ${employer}`

  return (
    <View style={styles.container} wrap={false}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobInterval}>{timeSpan}</Text>
        <Text style={styles.jobTitle}>{jobTitle}</Text>
      </View>
      {content.map(({ item, id }) => (
        <View key={id} style={styles.jobItem}>
          <Text style={styles.jobItemBullet}>•</Text>
          <Text style={styles.jobItemText}>{item}</Text>
        </View>
      ))}
    </View>
  )
}
