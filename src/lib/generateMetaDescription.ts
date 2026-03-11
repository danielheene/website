import { generateText } from 'ai'
import dedent from 'dedent'
import { createAnthropic } from '@ai-sdk/anthropic'

/**
 * Generates a meta-description based on the URL
 * @param url
 */
export const generateMetaDescription = async (url: string): Promise<string> => {
  'use server'

  const anthropic = createAnthropic({
    apiKey: process.env['ANTHROPIC_API_KEY'],
  })

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    system: dedent`
      Create a meta-description text for the following URL, focusing on optimization for Google and other major search engines. A meta-description is a short text that appears in search engine results below the page title.
      If you are looking for an in-depth context, such as the website operator's full name, information about their job, a categorization of the website and its intended purpose, as well as many other details, check out the JSON-LD objects embedded in the source code.
      The provided JSON-LD objects are also designed to define the section of the website, e.g. "homepage", "resume", "blog", "blog post".

      The meta-description should follow these requirements:

      CHARACTER COUNT:
      - Keep the meta-description between 150-160 characters (including spaces)
      - This is the optimal length to avoid being cut off in search results

      SEO OPTIMIZATION:
      - Include relevant keywords naturally
      - Make it compelling and informative
      - Accurately describe what users will find on the page

      TONE AND CALL-TO-ACTION:
      - Use an action-oriented tone that encourages users to visit the website
      - Include clear calls-to-action
      - Mention key offerings
      - Create urgency or value proposition to encourage clicks
      - Use first person tone
    `,
    prompt: url,
  })

  return text
}
