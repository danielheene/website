'use server'

import { anthropic } from '@ai-sdk/anthropic'
import * as Sentry from '@sentry/nextjs'
import { generateText } from 'ai'
import dedent from 'dedent'

/**
 * Generates a meta-description based on the URL
 * @param url
 */
export const fetchAnthropicMetaDescription = async (url: string): Promise<string> =>
  Sentry.startSpan(
    {
      name: 'fetchAnthropicMetaDescription',
      op: 'gen_ai.invoke_agent',
    },
    async () => {
      const { text } = await generateText({
        model: anthropic('claude-haiku-4-5'),
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

      OUTPUT FORMAT:
      - Respond with the meta-description text ONLY - your entire response must be that one sentence or two, nothing else
      - Do not add a title, headings, bullet points, or a "why this works" style explanation
      - Do not offer multiple alternatives or label anything "Option 1" / "Recommended" - return exactly one meta-description, no picking between variants
      - No markdown formatting of any kind (no **bold**, no #headings, no code fences, no checkmarks)
      - No surrounding quotation marks
    `,
        prompt: url,
      })

      return text
        .replace(/^\s*```(?:\w+)?\s*\n?/, '')
        .replace(/\n?\s*```\s*$/, '')
        .trim()
    },
  )
