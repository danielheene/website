import { OpenAI } from 'openai'
import sharp, { SharpInput } from 'sharp'

/**
 * Generates an image alternative text based on the image
 */
export const generateImageAlternativeText = async (input: SharpInput): Promise<string> => {
  'use server'

  const resizedImageBuffer = await sharp(input)
    .autoOrient()
    .resize({ width: 512, height: 512, fit: 'inside' })
    .jpeg({ quality: 75 })
    .toBuffer()

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const { output_text } = await openai.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      {
        role: 'developer',
        content: 'Describe the following image in one, short, descriptive sentence for web accessibility.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_image',
            detail: 'auto',
            image_url: `data:image/jpeg;base64,${resizedImageBuffer.toString('base64')}`,
          },
        ],
      },
    ],
  })

  return output_text
}
