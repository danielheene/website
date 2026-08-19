import { Heading, Section, Text } from 'react-email'

import { EmailLayout } from '@/emails/components/EmailLayout'

export type ContactFormConfirmationEmailProps = {
  message: string
  name: string
  /** First name of the site owner, shown as the sign-off. */
  ownerFirstName?: string
  siteName: string
  siteUrl: string
}

/**
 * Sent to the person who submitted the contact form, as a copy of what
 * they sent and a confirmation that it was received. The message's
 * `replyTo` is set to the site owner's address, so replying reaches them
 * directly.
 */
export const ContactFormConfirmationEmail = ({
  message,
  name,
  ownerFirstName,
  siteName,
  siteUrl,
}: ContactFormConfirmationEmailProps) => (
  <EmailLayout
    previewText={`We've received your message to ${siteName}`}
    siteName={siteName}
    siteUrl={siteUrl}
  >
    <Heading as="h1" className="m-0 mb-4 text-xl font-bold text-neutral-900">
      Thanks for reaching out, {name}
    </Heading>
    <Text className="m-0 mb-6 text-sm text-neutral-600">
      This confirms {ownerFirstName ?? 'we'} received your message
      {ownerFirstName ? ` and will get back to you soon` : ''}. Here's a copy for your records:
    </Text>
    <Section className="rounded-md border border-solid border-neutral-200 bg-neutral-50 p-4">
      <Text className="m-0 whitespace-pre-line text-sm text-neutral-900">{message}</Text>
    </Section>
    <Text className="m-0 mt-6 text-sm text-neutral-600">
      Need to add anything? Just reply to this email
      {ownerFirstName ? ` — it goes straight to ${ownerFirstName}` : ''}.
    </Text>
  </EmailLayout>
)

ContactFormConfirmationEmail.PreviewProps = {
  name: 'Ada Lovelace',
  message:
    "Hi! I came across your work and would love to chat about a potential collaboration. Let me know if you're free sometime this week.",
  ownerFirstName: 'Daniel',
  siteName: 'heene.io',
  siteUrl: 'https://heene.io',
} satisfies ContactFormConfirmationEmailProps

export default ContactFormConfirmationEmail
