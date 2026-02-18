import ReactPDF from '@react-pdf/renderer'
import type { NextRequest } from 'next/server'

import { getCachedResumeDocumentData } from '@/lib/getResumeDocumentData'
import { ResumeDocument } from '@/pdfs/ResumeDocument'

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get('locale')
  const locale = localeParam === 'de' ? 'de' : 'en'

  const documentData = await getCachedResumeDocumentData(locale)
  const stream: ReadableStream = await ReactPDF.renderToStream(<ResumeDocument {...documentData} />)

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
    },
  })
}
