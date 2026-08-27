import { renderToBuffer } from '@react-pdf/renderer'
import type { NextRequest } from 'next/server'

import { z } from 'zod'

import { generateContentURL } from '@/lib/generateContentURL'
import { ResumeDocument } from '@/pdf'
import { buildResumeDocumentData } from '@/pdf/lib/buildResumeDocumentData'

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get('locale')
  const locale = localeParam === 'de' ? 'de' : 'en'

  const fileName = 'resume.pdf'

  const result = await buildResumeDocumentData({
    fileName,
    fileUrl: generateContentURL({
      path: '/resume/document/latest',
    }),
    creationDate: new Date(),
    locale,
  })
  if (!result.success) {
    const prettyErrors = z.prettifyError(result.error)
    return new Response(prettyErrors, {
      status: 404,
    })
  }

  const fileBuffer = await renderToBuffer(<ResumeDocument {...result.data} />)

  const blob = new Blob(
    [
      Buffer.from(fileBuffer),
    ],
    {
      type: 'application/pdf',
    },
  )
  return new Response(blob, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
    },
  })
}
