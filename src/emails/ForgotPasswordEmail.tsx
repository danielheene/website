import { Button, Heading, Text } from 'react-email'

import { EmailLayout } from '@/emails/components/EmailLayout'
import { PREVIEW_SITE, type EmailSite } from '@/emails/site'

export type ForgotPasswordEmailProps = {
  /** The admin's reset page with the token, built by the Users collection's auth config. */
  resetUrl: string
  site: EmailSite
}

/** Payload's forgot-password email, sent when a password reset is requested in the admin. */
export const ForgotPasswordEmail = ({ resetUrl, site }: ForgotPasswordEmailProps) => (
  <EmailLayout
    previewText="Reset your password"
    context={`You received this email because a password reset was requested for your account on ${site.name}.`}
    site={site}
  >
    <Heading
      as="h1"
      className="font-heading mobile:text-4xl m-0 text-5xl leading-none font-medium uppercase"
    >
      Password reset
    </Heading>
    <Text className="m-0 mt-8 text-base">
      We received a request to reset the password for your account on {site.name}.
    </Text>
    <Text className="dark:text-muted-foreground-dark m-0 mt-4 text-sm text-muted-foreground">
      If you didn&apos;t request a reset, you can safely ignore this email.
    </Text>
    <Button
      href={resetUrl}
      className="mobile:mt-8 mt-12 bg-primary px-5 py-3.5 text-center text-base text-primary-foreground"
    >
      Create new password
    </Button>
  </EmailLayout>
)

ForgotPasswordEmail.PreviewProps = {
  resetUrl: 'https://heene.io/admin/reset/example-token',
  site: PREVIEW_SITE,
} satisfies ForgotPasswordEmailProps

export default ForgotPasswordEmail
