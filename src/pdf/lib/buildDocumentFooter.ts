'use server'

import { DocumentFooterData } from '@pdf/types'
import { type Locale, translate } from '@/lib/i18n'

type BuildDocumentFooterDataArgs = {
  locale: Locale
  fileName: string
}

export const buildDocumentFooterData = async ({
  locale,
  fileName,
}: BuildDocumentFooterDataArgs): Promise<DocumentFooterData> => ({
  generatedNotice: translate(locale, 'document.footer.generatedNotice', {
    fileName,
  }),
  renderPagination: (pageNumber: string, totalPages: string) =>
    translate(locale, 'document.footer.pagination', {
      pageNumber,
      totalPages,
    }),
})
