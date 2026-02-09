import { registerFontInter, registerFontJetBrainsMono, registerFontPPSupplyMono } from '@/pdfs/utils'
import { ResumeExperienceGlobalData } from '@payload-types'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import { Document, DocumentProps, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

registerFontInter()
registerFontJetBrainsMono()
registerFontPPSupplyMono()
// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    paddingTop: '1cm',
    paddingBottom: '1cm',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  section: {
    flexDirection: 'column',
    gap: '1cm',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    fontFamily: 'Inter',
    margin: 10,
    padding: 10,
  },
})

const Experience = ({ title, caption }: ResumeExperienceGlobalData) => {
  return (
    <View style={styles.section}>
      <Text>{title}</Text>
      <Text>{convertLexicalToPlaintext({ data: caption })}</Text>
      <Text style={{ flexDirection: 'column', gap: '0.5cm' }}>YE</Text>
    </View>
  )
}

interface ResumeDocumentProps {
  author?: DocumentProps['author']
  title?: DocumentProps['title']
  keywords?: DocumentProps['keywords']
  subject?: DocumentProps['subject']
  creator?: DocumentProps['creator']
  creationDate?: DocumentProps['creationDate']
  modificationDate?: DocumentProps['modificationDate']
  isPreview?: boolean
  debug?: { page?: boolean; view?: boolean }
  experience?: ResumeExperienceGlobalData
}

export const ResumeDocument = ({
  author,
  title,
  keywords,
  subject,
  creator,
  creationDate,
  modificationDate,
  isPreview = false,
  debug: { page: debugPage = false, view: debugView = false } = {},
  experience,
}: ResumeDocumentProps) => {
  const logoURL = process.env.NEXT_PUBLIC_SERVER_URL + '/pdf/logo.png'

  return (
    <Document
      author={author}
      title={title}
      keywords={keywords}
      subject={subject}
      creator={creator}
      creationDate={creationDate}
      modificationDate={modificationDate}
    >
      <Page size="A4" style={styles.page} dpi={isPreview ? 75 : 300} orientation="portrait" debug={debugPage}>
        <View style={styles.section} debug={debugView}>
          <Image src={logoURL} style={{ width: '12cm', height: '6.2cm', border: '1pt solid black' }} />
          <Text>Section #1</Text>
        </View>
        <Experience {...experience} />
        <View style={styles.section} debug={debugView}>
          {Array.from({ length: 9 }, (_, i) => (
            <View key={i} wrap={false}>
              <Text>Subsection #1.{i}</Text>
              <Text>
                Exercitation consequat commodo officia proident officia aliquip. Elit ad consequat sit labore dolore irure sunt duis qui
                laborum. Dolor aliqua ea voluptate velit consequat ex magna ex ullamco. In ad consectetur qui magna nulla id ex non ullamco
                tempor nisi adipisicing laborum. Qui ullamco dolor pariatur ullamco aliquip aliqua eu sit. Nisi eu eu laborum mollit
                voluptate est ipsum eu.
              </Text>
            </View>
          ))}
        </View>
        <Text
          render={({ pageNumber, totalPages }) => {
            return `Page ${pageNumber} of ${totalPages}`
          }}
        />
      </Page>
    </Document>
  )
}
