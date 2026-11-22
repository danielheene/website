import { Button, Heading, Text } from 'react-email'

import { EmailLayout } from '@/emails/components/EmailLayout'
import { PREVIEW_SITE, type EmailSite } from '@/emails/site'

export type VerifyEmailProps = {
  /** The admin's verification page with the token, built by the Users collection's auth config. */
  verifyUrl: string
  site: EmailSite
}

/** Payload's verification email, sent when an admin account is created. */
export const VerifyEmail = ({ verifyUrl, site }: VerifyEmailProps) => (
  <EmailLayout
    previewText="Verify your email address"
    context={`You received this email because an account was created with this address on ${site.name}.`}
    site={site}
  >
    <Heading
      as="h1"
      className="font-heading mobile:text-4xl m-0 text-5xl leading-none font-medium uppercase"
    >
      Verify your email
    </Heading>
    <Text className="m-0 mt-8 text-base">
      An account on {site.name} was created with this email address. Confirm it&apos;s yours to
      start using the account.
    </Text>
    <Text className="dark:text-muted-foreground-dark m-0 mt-4 text-sm text-muted-foreground">
      If you didn&apos;t expect this, you can safely ignore this email.
    </Text>
    <Button
      href={verifyUrl}
      className="mobile:mt-8 mt-12 bg-primary px-5 py-3.5 text-center text-base text-primary-foreground"
    >
      Verify email address
    </Button>
  </EmailLayout>
)

VerifyEmail.PreviewProps = {
  verifyUrl: 'https://heene.io/admin/users/verify/example-token',
  site: PREVIEW_SITE,
} satisfies VerifyEmailProps

export default VerifyEmail
