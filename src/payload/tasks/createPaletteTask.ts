import type { JsonObject, TaskConfig } from 'payload'
import { camelCase } from 'lodash-es'
import Vibrant from 'node-vibrant'
import { PaletteDetails } from '@custom-types'

export const createPaletteTask: TaskConfig<'createPalette'> = {
  slug: 'createPalette',
  label: 'Create Palette',
  retries: 3,
  inputSchema: [
    {
      name: 'base64',
      type: 'text',
      required: true,
    },
  ],
  outputSchema: [
    {
      name: 'palette',
      type: 'json',
      required: true,
    },
  ],
  handler: async ({ input: { base64 } }) => {
    const buffer = Buffer.from(base64, 'base64')
    const vibrantPalette = await Vibrant.from(buffer).getPalette()

    const swatchesString = Object.values(vibrantPalette)
      .map(({ hex }) => hex.replace(/^#+/, ''))
      .toString()

    const paletteDetails = await fetch(`https://api.color.pizza/v1/?values=${swatchesString}`)
      .then((r) => r.json() as Promise<PaletteDetails>)
      .then(({ colors }) => colors)

    const palette: JsonObject = Object.entries(vibrantPalette).reduce(
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

    return { output: { palette } }
  },
}
