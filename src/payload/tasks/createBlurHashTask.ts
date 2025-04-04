import type { TaskConfig } from 'payload'
import { getImageData } from '@/utilities/getImageDataFromUrl'
import { encode } from 'blurhash'

export const createBlurHashTask: TaskConfig<'createBlurHash'> = {
  slug: 'createBlurHash',
  label: 'Create BlurHash',
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
      name: 'blurHash',
      type: 'text',
      required: true,
    },
  ],
  handler: async ({ input: { base64 } }) => {
    const buffer = Buffer.from(base64, 'base64')
    const imageData = await getImageData(buffer)
    const blurHash = encode(imageData.data, imageData.width, imageData.height, 4, 4)

    return { output: { blurHash } }
  },
}
