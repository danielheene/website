import type {
  ResumeAboutMeGlobalData,
  ResumeContactGlobalData,
  ResumeCustomersGlobalData,
  ResumeDownloadsGlobalData,
  ResumeExperienceGlobalData,
  ResumeProjectsGlobalData,
  UserMetaData,
} from '@payload-types'
import { Document, type DocumentProps, Font, Page, StyleSheet } from '@react-pdf/renderer'
import createHyphenator, { type HyphenationFunctionSync, type PatternsDefinition } from 'hyphen'
import dePattern from 'hyphen/patterns/de-1996'
import enPattern from 'hyphen/patterns/en-us'

import { WorkExperience } from '@/pdfs/ResumeDocument/WorkExperience'

import { registerFonts } from '../fonts'
import { Header } from './Header'
import { Introduction } from './Introduction'

const hyphenateEN = createHyphenator(enPattern as unknown as PatternsDefinition, { async: false }) as HyphenationFunctionSync
const hyphenateDE = createHyphenator(dePattern as unknown as PatternsDefinition, { async: false }) as HyphenationFunctionSync

const { PPSupplyMono } = registerFonts(['PPSupplyMono', 'PPFramer', 'PPFramerText'])

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
  locale?: string
  userMetaData: UserMetaData
  aboutMe: ResumeAboutMeGlobalData
  contact: ResumeContactGlobalData
  customers: ResumeCustomersGlobalData
  downloads: ResumeDownloadsGlobalData
  experience: ResumeExperienceGlobalData
  projects: ResumeProjectsGlobalData
}

export const ResumeDocument = ({
  isPreview = false,
  locale = 'en',
  userMetaData,
  aboutMe,
  contact,
  customers,
  downloads,
  experience,
}: ResumeDocumentProps) => {
  const documentTitle = locale === 'en' ? `Resume of ${userMetaData.name}` : `Lebenslauf von ${userMetaData.name}`

  Font.registerHyphenationCallback((word) => {
    const hyphenatedWords = locale === 'en' ? hyphenateEN(word) : hyphenateDE(word)
    return hyphenatedWords.split('\u00AD')
  })

  return (
    <Document
      author={userMetaData.name}
      title={documentTitle}
      language={locale}
      creationDate={new Date()}
      pageMode="useOutlines"
      pageLayout="singlePage"
    >
      <Page size="A4" style={styles.page} dpi={300} orientation="portrait">
        <Header locale={locale} {...userMetaData} />
        <Introduction locale={locale} {...userMetaData} />
        <WorkExperience locale={locale} {...experience} />
      </Page>
    </Document>
  )
}
