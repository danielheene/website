'use server'

import { type BilingualLanguage, translate } from '@/lib/i18n'
import { DocumentFooter } from '@/pdf/types'

type BuildDocumentFooterDataArgs = {
  locale: BilingualLanguage
  documentUrl: string
}

export const buildDocumentFooter = async ({
  locale,
  documentUrl,
}: BuildDocumentFooterDataArgs): Promise<DocumentFooter> => ({
  generatedNotice: translate(locale, 'document.footer.generatedNotice', {
    documentUrl,
  }),
  documentUrl,
  renderPagination: (pageNumber: string, totalPages: string) =>
    translate(locale, 'document.footer.pagination', {
      pageNumber,
      totalPages,
    }),
})
