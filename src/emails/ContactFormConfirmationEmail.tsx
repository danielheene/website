import { Heading, Section, Text } from 'react-email'

import { EmailLayout } from '@/emails/components/EmailLayout'
import { PREVIEW_SITE, type EmailSite } from '@/emails/site'

export type ContactFormConfirmationEmailProps = {
  message: string
  name: string
  /** First name of the site owner, named as who received the message and gets back to them. */
  ownerFirstName?: string
  site: EmailSite
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
  site,
}: ContactFormConfirmationEmailProps) => (
  <EmailLayout
    previewText={`We've received your message to ${site.name}`}
    context={`You received this email because you sent a message through the contact form on ${site.name}.`}
    site={site}
  >
    <Heading
      as="h1"
      className="font-heading mobile:text-4xl m-0 text-5xl leading-none font-medium uppercase"
    >
      Message received
    </Heading>
    <Text className="m-0 mt-8 text-base">
      Thanks for reaching out, {name}. This confirms {ownerFirstName ?? 'we'} received your message
      {ownerFirstName ? ` and will get back to you soon` : ''}. Here's a copy for your records:
    </Text>
    {/* the prose blockquote (`frontend.css`): primary bar, muted italic text */}
    <Section className="my-6 border-0 border-l-2 border-solid border-primary pl-4">
      <Text className="dark:text-muted-foreground-dark m-0 text-base text-muted-foreground italic">
        {message}
      </Text>
    </Section>
    <Text className="dark:text-muted-foreground-dark m-0 text-sm text-muted-foreground">
      Need to add anything? Just reply to this email
      {ownerFirstName ? ` — it goes straight to ${ownerFirstName}` : ''}.
    </Text>
  </EmailLayout>
)

ContactFormConfirmationEmail.PreviewProps = {
  message:
    "Hi! I came across your work and would love to chat about a potential collaboration. Let me know if you're free sometime this week.",
  name: 'Ada Lovelace',
  ownerFirstName: 'Daniel',
  site: PREVIEW_SITE,
} satisfies ContactFormConfirmationEmailProps

export default ContactFormConfirmationEmail
