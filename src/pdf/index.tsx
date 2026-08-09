import { Document, Font, Page, StyleSheet, View } from '@react-pdf/renderer'

import createHyphenator, { type HyphenationFunctionSync, type PatternsDefinition } from 'hyphen'
import dePattern from 'hyphen/patterns/de-1996'
import enPattern from 'hyphen/patterns/en-us'

import type { Locale } from '@/lib/i18n'
import { BulletPoint } from '@/pdf/components/BulletPoint'
import { Footer } from '@/pdf/components/Footer'
import { Header } from '@/pdf/components/Header'
import { Introduction } from '@/pdf/components/Introduction'
import { Section } from '@/pdf/components/Section'
import { SkillEntry } from '@/pdf/components/SkillEntry'
import { WorkExperience } from '@/pdf/components/WorkExperience'
import { sizes } from '@/pdf/constants'
import { DocumentFooter, DocumentHeader, DocumentSection, DocumentSectionType } from '@/pdf/types'

const hyphenateEN = createHyphenator(enPattern as unknown as PatternsDefinition, {
  async: false,
}) as HyphenationFunctionSync
const hyphenateDE = createHyphenator(dePattern as unknown as PatternsDefinition, {
  async: false,
}) as HyphenationFunctionSync

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    ...sizes.page,
  },
  header: {
    alignSelf: 'flex-start',
    flexGrow: 0,
    flexShrink: 0,
    ...sizes.header,
  },
  body: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    ...sizes.body,
  },
  footer: {
    alignSelf: 'flex-end',
    flexGrow: 0,
    flexShrink: 0,
    ...sizes.footer,
  },
})

interface ResumeDocumentProps {
  isPreview: boolean
  locale: Locale
  document: {
    title: string
    author: string
    language: string
    creationDate: Date
  }
  header: DocumentHeader
  footer: DocumentFooter
  sections: DocumentSection[]
}

export const ResumeDocument = ({
  isPreview,
  locale,
  document,
  header,
  footer,
  sections,
}: ResumeDocumentProps) => {
  Font.registerHyphenationCallback((word) => {
    const hyphenatedWords = locale === 'en' ? hyphenateEN(word) : hyphenateDE(word)
    return hyphenatedWords.split('\u00AD')
  })

  return (
    <Document {...document} pageMode="useOutlines" pageLayout="twoPageLeft" pdfVersion="1.7">
      <Page
        size="A4"
        style={styles.page}
        dpi={300}
        orientation="portrait"
        bookmark={document.title}
      >
        <Header {...header} style={styles.header} fixed />
        <View style={styles.body}>
          {sections.map(({ type, data }, sectionIndex) => {
            /**
             * Introduction Section
             */
            if (type === DocumentSectionType.Introduction) {
              const { headline, content } = data
              return (
                <Section.Container key={sectionIndex}>
                  <Section.Headline bookmark="Introduction" withoutLine>
                    {headline}
                  </Section.Headline>
                  <Introduction>{content}</Introduction>
                </Section.Container>
              )
            }

            /**
             * Work Experience Section
             */
            if (type === DocumentSectionType.WorkExperience) {
              const { headline, entries } = data
              return (
                <Section.Container key={sectionIndex} wrap={false}>
                  <Section.Headline bookmark={headline}>{headline}</Section.Headline>
                  {entries.map(({ title, interval, tasks }, entryIndex) => (
                    <WorkExperience.Entry key={entryIndex}>
                      <WorkExperience.Header
                        title={title}
                        interval={interval}
                        bookmark={{
                          title,
                          parent: sectionIndex + 1,
                        }}
                      />
                      <WorkExperience.TaskList tasks={tasks} />
                    </WorkExperience.Entry>
                  ))}
                </Section.Container>
              )
            }

            /**
             * Skill Section
             */
            if (type === DocumentSectionType.Skill) {
              const { headline, entries } = data
              return (
                <Section.Container key={sectionIndex} wrap={false}>
                  <Section.Headline bookmark={headline}>{headline}</Section.Headline>
                  {entries.map((skill, entryIndex) => (
                    <SkillEntry key={entryIndex} {...skill} />
                  ))}
                </Section.Container>
              )
            }

            if (type === DocumentSectionType.Language) {
              const { headline, entries } = data
              return (
                <Section.Container key={sectionIndex} wrap={false}>
                  <Section.Headline bookmark={headline}>{headline}</Section.Headline>
                  {entries.map((language, entryIndex) => (
                    <BulletPoint key={entryIndex}>{language}</BulletPoint>
                  ))}
                </Section.Container>
              )
            }

            /**
             * Unknown Section
             */
            return null
          })}
        </View>
        <Footer {...footer} style={styles.footer} fixed />
      </Page>
    </Document>
  )
}
