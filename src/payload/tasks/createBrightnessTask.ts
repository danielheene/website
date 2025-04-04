import type { TaskConfig } from 'payload'
import { getImageData } from '@/utilities/getImageDataFromUrl'
import { chunk } from 'lodash-es'

export const createBrightnessTask: TaskConfig<'createBrightness'> = {
  slug: 'createBrightness',
  label: 'Create Brightness',
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
      name: 'brightness',
      type: 'number',
      required: true,
    },
  ],
  handler: async ({ input: { base64 } }) => {
    const buffer = Buffer.from(base64, 'base64')
    const imageData = await getImageData(buffer)
    const summarizedBrightnesses = chunk(imageData.data, 4).reduce(
      (brightnessAcc, [r, g, b]: [number, number, number, number]) => {
        return brightnessAcc + Math.round((r + g + b) / 3)
      },
      0,
    )
    const brightness =
      Math.round(summarizedBrightnesses / (imageData.width * imageData.height)) || 0

    return { output: { brightness } }
  },
}
