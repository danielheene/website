import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ForgotPasswordEmail, type ForgotPasswordEmailProps } from '@/emails/ForgotPasswordEmail'
import { VerifyEmail, type VerifyEmailProps } from '@/emails/VerifyEmail'

import { EmailPreview } from './EmailPreview'

const meta = {
  title: 'Auth',
  parameters: {
    layout: 'fullscreen',
  },
  // EmailPreview brings its own toolbar, so preview-only hides Storybook's (see manager.tsx)
  tags: ['!autodocs', 'preview-only'],
} satisfies Meta

export default meta

/** Payload's forgot-password email, linking to the admin's reset page. */
export const ForgotPassword: StoryObj<ForgotPasswordEmailProps> = {
  args: ForgotPasswordEmail.PreviewProps,
  render: (args) => <EmailPreview email={<ForgotPasswordEmail {...args} />} />,
}

/** Payload's verification email; unused while verification is off on Users. */
export const Verify: StoryObj<VerifyEmailProps> = {
  args: VerifyEmail.PreviewProps,
  render: (args) => <EmailPreview email={<VerifyEmail {...args} />} />,
}
