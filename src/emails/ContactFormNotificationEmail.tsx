import { Heading, Hr, Link, Section, Text } from '@react-email/components'

import { EmailLayout } from '@/emails/components/EmailLayout'

export type ContactFormNotificationEmailProps = {
  /** The email address the submitter left, so it can be shown alongside the reply-to. */
  email: string
  message: string
  name: string
  /** First name of the site owner receiving this notification, for the greeting. */
  ownerFirstName?: string
  siteName: string
  siteUrl: string
}

/**
 * Sent to the site owner whenever the contact form is submitted. The
 * message's `replyTo` is set to the submitter's address, so replying to
 * this email replies straight to them.
 */
export const ContactFormNotificationEmail = ({
  email,
  message,
  name,
  ownerFirstName,
  siteName,
  siteUrl,
}: ContactFormNotificationEmailProps) => (
  <EmailLayout
    previewText={`New contact form message from ${name}`}
    siteName={siteName}
    siteUrl={siteUrl}
  >
    <Heading as="h1" className="m-0 mb-4 text-xl font-bold text-neutral-900">
      New contact form message
    </Heading>
    <Text className="m-0 mb-6 text-sm text-neutral-600">
      {ownerFirstName ? `Hi ${ownerFirstName}, someone` : 'Someone'} just reached out through the
      contact form on {siteName}. Reply to this email to respond directly to {name}.
    </Text>
    <Section className="rounded-md border border-solid border-neutral-200 bg-neutral-50 p-4">
      <Text className="m-0 mb-1 text-xs font-bold uppercase tracking-wide text-neutral-400">
        From
      </Text>
      <Text className="m-0 mb-4 text-sm text-neutral-900">
        {name} &lt;
        <Link href={`mailto:${email}`} className="text-primary-600">
          {email}
        </Link>
        &gt;
      </Text>
      <Text className="m-0 mb-1 text-xs font-bold uppercase tracking-wide text-neutral-400">
        Message
      </Text>
      <Text className="m-0 whitespace-pre-line text-sm text-neutral-900">{message}</Text>
    </Section>
    <Hr className="my-6 border-neutral-200" />
    <Text className="m-0 text-xs text-neutral-400">
      A confirmation copy of this message was also sent to {name} at {email}.
    </Text>
  </EmailLayout>
)

ContactFormNotificationEmail.PreviewProps = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message:
    "Hi! I came across your work and would love to chat about a potential collaboration. Let me know if you're free sometime this week.",
  ownerFirstName: 'Daniel',
  siteName: 'heene.io',
  siteUrl: 'https://heene.io',
} satisfies ContactFormNotificationEmailProps

export default ContactFormNotificationEmail
