'use server'

import { DocumentFooter } from '@pdf/types'
import { type Locale, translate } from '@/lib/i18n'

type BuildDocumentFooterDataArgs = {
  locale: Locale
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
