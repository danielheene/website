import { NextRequest, NextResponse } from 'next/server'
import Vibrant from 'node-vibrant'
import { camelCase } from 'lodash-es'
import { getImageFromUrl } from '@/utilities/getImageDataFromUrl'

type RequestData = {
  imageUrl: string
}

type SwatchDetails = {
  name: string
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  lab: { l: number; a: number; b: number }
  luminance: number
  luminanceWCAG: number
  bestContrast: 'white' | 'black'
  requestedHex: string
  distance: number
}

type PaletteDetails = {
  colors: SwatchDetails[]
}

export async function POST(request: NextRequest) {
  const { imageUrl }: RequestData = await request.json()

  try {
    const image = await getImageFromUrl(imageUrl)
    const vibrantPalette = await Vibrant.from(Buffer.from(image.src)).getPalette()

    const swatchesString = Object.values(vibrantPalette)
      .map(({ hex }) => hex.replace(/^#+/, ''))
      .toString()

    const paletteDetails = await fetch(`https://api.color.pizza/v1/?values=${swatchesString}`)
      .then((r) => r.json() as Promise<PaletteDetails>)
      .then(({ colors }) => colors)

    const palette = Object.entries(vibrantPalette).reduce(
      (paletteAcc, [swatchName, { population }], index) => {
        const {
          name: colorName,
          bestContrast,
          requestedHex,
          distance,
          luminance,
        } = paletteDetails[index]

        paletteAcc[camelCase(swatchName)] = {
          name: colorName.replaceAll(' ', ''),
          background: requestedHex,
          foreground: bestContrast.replace('white', '#ffffff').replace('black', '#000000'),
          population,
          distance,
          luminance,
        }

        return paletteAcc
      },
      {},
    )

    return NextResponse.json({ palette })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message, palette: null }, { status: 500 })
  }
}
