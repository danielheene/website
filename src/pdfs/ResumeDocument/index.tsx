import { WorkExperience } from '@/pdfs/ResumeDocument/WorkExperience'
import {
  ResumeAboutMeGlobalData,
  ResumeContactGlobalData,
  ResumeCustomersGlobalData,
  ResumeDownloadsGlobalData,
  ResumeExperienceGlobalData,
  ResumeProjectsGlobalData,
  UserMetaData,
} from '@payload-types'
import { Document, Page, StyleSheet } from '@react-pdf/renderer'
import { registerFonts } from '../fonts'
import { Header } from './Header'
import { Introduction } from './Introduction'

const { PPFramerText, PPFramer, PPSupplyMono } = registerFonts(['PPSupplyMono', 'PPFramer', 'PPFramerText'])

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: '1.25cm',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    columnGap: '1cm',
  },
  section: {
    flexDirection: 'column',
    gap: '1cm',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    fontFamily: PPSupplyMono,
    margin: 10,
    padding: 10,
  },
})

interface ResumeDocumentProps {
  isPreview?: boolean
  debug?: { page?: boolean; view?: boolean }
  locale?: string
  userMetaData?: UserMetaData
  aboutMe?: ResumeAboutMeGlobalData
  contact?: ResumeContactGlobalData
  customers?: ResumeCustomersGlobalData
  downloads?: ResumeDownloadsGlobalData
  experience?: ResumeExperienceGlobalData
  projects?: ResumeProjectsGlobalData
}

export const ResumeDocument = ({
  isPreview = false,
  debug: { page: debugPage = false, view: debugView = false } = {},
  locale = 'en',
  userMetaData,
  aboutMe,
  contact,
  customers,
  downloads,
  experience,
}: ResumeDocumentProps) => {
  const documentTitle = locale === 'en' ? `Resume of ${userMetaData.name}` : `Lebenslauf von ${userMetaData.name}`

  return (
    <Document author={userMetaData.name} title={documentTitle} creator={userMetaData.name}>
      <Page size="A4" style={styles.page} dpi={72} orientation="portrait" debug={debugPage}>
        <Header locale={locale} {...userMetaData} />
        <Introduction locale={locale} {...userMetaData} />
        <WorkExperience locale={locale} {...experience} />
      </Page>
    </Document>
  )
}
