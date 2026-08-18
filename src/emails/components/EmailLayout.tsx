import type React from 'react'
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

import { emailTheme } from '@/emails/theme'

export type EmailLayoutProps = {
  children: React.ReactNode
  /** Shown as the inbox preview snippet, before the email is opened. */
  previewText: string
  siteName: string
  siteUrl: string
}

/**
 * Shared chrome for every transactional email: a branded header, the
 * message body, and a small footer linking back to the site. Wrap each
 * template's content in this so they share one look, themed with
 * {@link emailTheme}.
 */
export const EmailLayout = ({ children, previewText, siteName, siteUrl }: EmailLayoutProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Tailwind config={emailTheme}>
      <Body className="bg-neutral-100 py-10 font-sans">
        <Container className="mx-auto max-w-[600px] rounded-lg bg-white">
          <Section className="rounded-t-lg bg-primary-500 px-8 py-6">
            <Link href={siteUrl} className="font-sans text-lg font-bold text-white no-underline">
              {siteName}
            </Link>
          </Section>
          <Section className="px-8 py-8">{children}</Section>
          <Hr className="mx-8 my-0 border-neutral-200" />
          <Section className="px-8 py-6">
            <Text className="m-0 text-xs text-neutral-400">
              This message was sent from the contact form on{' '}
              <Link href={siteUrl} className="text-neutral-400 underline">
                {siteName}
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
)
