import dedent from 'dedent'
import sharp, { type SharpInput } from 'sharp'

import { generateAnthropicText } from '@/lib/anthropic/generateAnthropicText'

// Large enough for text in the image to stay legible to the model.
const MAX_EDGE_PX = 1024

/**
 * Generates an image alternative text based on the image
 * @param input
 */
export const fetchAnthropicImageAltText = async (input: SharpInput): Promise<string> => {
  const resizedImageBuffer = await sharp(input)
    .autoOrient()
    .resize({
      width: MAX_EDGE_PX,
      height: MAX_EDGE_PX,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 80,
    })
    .toBuffer()

  return generateAnthropicText({
    functionId: 'fetchAnthropicImageAltText',
    maxOutputTokens: 1024,
    system: dedent`
      You write alt text for images on a personal website and blog, read aloud
      by screen readers to people who cannot see the image.

      Describe what the image shows in one English sentence, under 125
      characters where possible:
        - Lead with the most important content and be specific and factual
        - Describe it directly, without openers such as "Image of" or "Picture of"
        - Include text shown in the image when it matters for understanding it
        - Mention mood or style only when that is the point of the image
        - For an abstract or decorative image, name its visual character briefly

      Return only the alt text, without quotation marks.
    `,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            image: resizedImageBuffer,
          },
          {
            type: 'text',
            text: 'Write the alt text for this image.',
          },
        ],
      },
    ],
  })
}
