import { NextRequest, NextResponse } from 'next/server'
import { JSDOM } from 'jsdom'
import DOMPurify from 'dompurify'
import { optimize } from 'svgo'

const window = new JSDOM('').window
const purify = DOMPurify(window)

type RequestData = {
  logo: string
}

export async function POST(request: NextRequest) {
  const { logo: requestData }: RequestData = await request.json()

  try {
    const sanitizedData = purify.sanitize(requestData, {
      USE_PROFILES: { svg: true },
      KEEP_CONTENT: true,
      FORBID_TAGS: ['style', 'script', 'image', 'g'],
      FORBID_ATTR: ['class', 'style', 'fill', 'id', 'width', 'height'],
    })

    const optimizedData = optimize(sanitizedData, {
      multipass: true,
      plugins: ['preset-default', 'mergePaths'],
    })

    return NextResponse.json({
      logo: optimizedData.data,
    })
  } catch (_) {
    return NextResponse.json({
      logo: null,
    })
  }
}
