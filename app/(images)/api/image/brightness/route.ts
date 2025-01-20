import { NextRequest, NextResponse } from 'next/server'
import { chunk } from 'lodash-es'
import { getImageDataFromUrl } from '@/utilities/getImageDataFromUrl'

type RequestData = {
  imageUrl: string
}

export async function POST(request: NextRequest) {
  const { imageUrl }: RequestData = await request.json()

  try {
    const imageData = await getImageDataFromUrl(imageUrl)
    const summarizedBrightnesses = chunk(imageData.data, 4).reduce(
      (brightnessAcc, [r, g, b]: [number, number, number, number]) => {
        return brightnessAcc + Math.round((r + g + b) / 3)
      },
      0,
    )
    const brightness =
      Math.round(summarizedBrightnesses / (imageData.width * imageData.height)) || 0

    return NextResponse.json({ brightness })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message, brightness: null }, { status: 500 })
  }
}
