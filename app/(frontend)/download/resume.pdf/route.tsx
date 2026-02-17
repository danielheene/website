import { getCachedResumeDocumentData } from '@/lib/getResumeDocumentData'
import { ResumeDocument } from '@/pdfs/ResumeDocument'
import ReactPDF from '@react-pdf/renderer'
import { NextRequest } from 'next/server'

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
