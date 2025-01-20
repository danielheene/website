import { NextRequest, NextResponse } from 'next/server'
import { encode } from 'blurhash'
import { getImageDataFromUrl } from '@/utilities/getImageDataFromUrl'

type RequestData = {
  imageUrl: string
}

export async function POST(request: NextRequest) {
  const { imageUrl }: RequestData = await request.json()

  try {
    const imageData = await getImageDataFromUrl(imageUrl)
    const blurHash = encode(imageData.data, imageData.width, imageData.height, 4, 4)

    return NextResponse.json({ blurHash })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message, blurHash: null }, { status: 500 })
  }
}
