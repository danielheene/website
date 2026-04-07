import { ImageResponse } from 'next/og'
import sharp from 'sharp'

import { ImageMedia } from '@/components/ImageMedia'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const imageParam = searchParams.get('image')
    const wParam = searchParams.get('w')
    const hParam = searchParams.get('h')

    const img = new URL(`/_next/image`, request.url)
    img.searchParams.set('url', imageParam)
    img.searchParams.set('w', wParam)
    img.searchParams.set('h', hParam)
    img.searchParams.set('q', '85')

    const imageResponse = await fetch(img)
    const imageBuffer = await imageResponse.arrayBuffer()
    const imageMetadata = await sharp(imageBuffer).metadata()
    const imageMimeType = `image/${imageMetadata.format}`
    const imageBase64 = Buffer.from(imageBuffer).toString('base64')
    const imageData = `data:${imageMimeType};base64,${imageBase64}`

    return new ImageResponse(
      <ImageMedia alt="" url={imageData} width={imageMetadata.width} height={imageMetadata.height} duoTone={true} />,
      {
        width: imageMetadata.width,
        height: imageMetadata.height,
      },
    )
  } catch (_e: unknown) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
