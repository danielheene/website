'use server'

import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import dedent from 'dedent'
import sharp, { type SharpInput } from 'sharp'

/**
 * Generates an image alternative text based on the image
 * @param input
 */
export const fetchAnthropicImageAltText = async (input: SharpInput): Promise<string> => {
  const resizedImageBuffer = await sharp(input)
    .autoOrient()
    .resize({
      width: 512,
      height: 512,
      fit: 'inside',
    })
    .jpeg({
      quality: 75,
    })
    .toBuffer()

  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5'),
    system: dedent`
      Write a short but meaningful sentence that explains the attached image and helps improve its accessibility by describing the content of the image, adapted for visually impaired people or users of screen readers.

      Your alt text should follow these guidelines:
        - Keep it concise (typically one sentence, under 125 characters when possible)
        - Describe the most important or relevant content in the image
        - Be specific and factual about what is shown
        - Avoid starting with phrases like "Image of..." or "Picture of..." - just describe what's there
        - Focus on information that would be useful to someone who cannot see the image
        - If there is text in the image that is important to understanding it, include that text in your description
        - Avoid subjective interpretations unless the mood/tone is clearly the main point of the image
    `,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            image: resizedImageBuffer,
          },
        ],
      },
    ],
  })

  return text
}
