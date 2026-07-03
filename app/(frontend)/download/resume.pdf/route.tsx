import { generateResumeDocument } from '@pdf/generateResumeDocument'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get('locale')
  const locale = localeParam === 'de' ? 'de' : 'en'

  const { fileName, fileBuffer } = await generateResumeDocument({
    locale,
  })

  const blob = new Blob(
    [
      fileBuffer,
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
