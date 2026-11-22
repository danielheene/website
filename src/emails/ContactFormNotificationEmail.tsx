import { Heading, Link, Section, Text } from 'react-email'

import { EmailLayout } from '@/emails/components/EmailLayout'
import { PREVIEW_SITE, type EmailSite } from '@/emails/site'

export type ContactFormNotificationEmailProps = {
  /** The email address the submitter left, so it can be shown alongside the reply-to. */
  email: string
  message: string
  name: string
  /** First name of the site owner receiving this notification, for the greeting. */
  ownerFirstName?: string
  site: EmailSite
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
  site,
}: ContactFormNotificationEmailProps) => (
  <EmailLayout
    previewText={`New contact form message from ${name}`}
    context={`Sent by the contact form on ${site.name}. A confirmation copy went to ${name} at ${email}.`}
    site={site}
  >
    <Heading
      as="h1"
      className="font-heading mobile:text-4xl m-0 text-5xl leading-none font-medium uppercase"
    >
      New message
    </Heading>
    <Text className="m-0 mt-8 text-base">
      {ownerFirstName ? `Hi ${ownerFirstName}, someone` : 'Someone'} just reached out through the
      contact form on {site.name}. Reply to this email to respond directly to {name}.
    </Text>
    <Section className="dark:border-border-dark dark:bg-muted-dark mt-6 border border-solid border-border bg-muted p-4">
      <Text className="dark:text-muted-foreground-dark m-0 mb-1 font-mono text-xs text-muted-foreground uppercase">
        From
      </Text>
      <Text className="m-0 mb-4 text-sm">
        {name} &lt;
        <Link href={`mailto:${email}`} className="text-primary underline">
          {email}
        </Link>
        &gt;
      </Text>
      <Text className="dark:text-muted-foreground-dark m-0 mb-1 font-mono text-xs text-muted-foreground uppercase">
        Message
      </Text>
      <Text className="m-0 text-sm whitespace-pre-line">{message}</Text>
    </Section>
  </EmailLayout>
)

ContactFormNotificationEmail.PreviewProps = {
  email: 'ada@example.com',
  message:
    "Hi! I came across your work and would love to chat about a potential collaboration. Let me know if you're free sometime this week.",
  name: 'Ada Lovelace',
  ownerFirstName: 'Daniel',
  site: PREVIEW_SITE,
} satisfies ContactFormNotificationEmailProps

export default ContactFormNotificationEmail
