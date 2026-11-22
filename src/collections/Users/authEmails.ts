import { render } from 'react-email'
import type { IncomingAuthType, PayloadRequest } from 'payload'

import { ForgotPasswordEmail } from '@/emails/ForgotPasswordEmail'
import { getEmailSite } from '@/emails/getEmailSite'

// the admin pages Payload's own default emails link to
const adminUrl = (req: PayloadRequest, path: string) =>
  `${req.payload.config.serverURL}${req.payload.config.routes.admin}${path}`

/**
 * Payload's auth emails, rendered with the site's email templates. Verification stays off: the
 * `loginAfterCreate` hook logs the first user in before Payload could mark them verified.
 */
export const authEmails = {
  forgotPassword: {
    generateEmailSubject: () => 'Reset your password',
    generateEmailHTML: async ({ req, token }) =>
      render(
        ForgotPasswordEmail({
          resetUrl: adminUrl(req, `/reset/${token}`),
          site: await getEmailSite(req.payload),
        }),
      ),
  },
} satisfies Pick<IncomingAuthType, 'forgotPassword'>
