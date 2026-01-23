import { getGlobal } from '@/utilities/getGlobals'
import { ResumeDocument } from '@/pdfs/ResumeDocument'
import ReactPDF from '@react-pdf/renderer'
import { NextRequest } from 'next/server'
import { GlobalSlug } from '@custom-types'

export async function GET(request: NextRequest) {
  const experience = await getGlobal(GlobalSlug.ResumeExperience, 1)

  const buffer = (await ReactPDF.renderToStream(<ResumeDocument experience={experience} />)) as unknown as ReadableStream

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
    },
  })
}
