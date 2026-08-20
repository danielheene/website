'use server'

import { type BilingualLanguage, translate } from '@/lib/i18n'
import { DocumentFooter } from '@/pdf/types'

type BuildDocumentFooterDataArgs = {
  locale: BilingualLanguage
  fileName: string
  fileUrl: string
}

export const buildDocumentFooter = async ({
  locale,
  fileName,
  fileUrl,
}: BuildDocumentFooterDataArgs): Promise<DocumentFooter> => ({
  generatedNotice: translate(locale, 'document.footer.generatedNotice', {
    fileName,
  }),
  generatedNoticeUrl: fileUrl,
  renderPagination: (pageNumber: string, totalPages: string) =>
    translate(locale, 'document.footer.pagination', {
      pageNumber,
      totalPages,
    }),
})
