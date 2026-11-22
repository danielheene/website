import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  ContactFormConfirmationEmail,
  type ContactFormConfirmationEmailProps,
} from '@/emails/ContactFormConfirmationEmail'
import {
  ContactFormNotificationEmail,
  type ContactFormNotificationEmailProps,
} from '@/emails/ContactFormNotificationEmail'

import { EmailPreview } from './EmailPreview'

const meta = {
  title: 'Contact Form',
  parameters: {
    layout: 'fullscreen',
  },
  // EmailPreview brings its own toolbar, so preview-only hides Storybook's (see manager.tsx)
  tags: ['!autodocs', 'preview-only'],
} satisfies Meta

export default meta

/** Sent to whoever submitted the contact form. */
export const Confirmation: StoryObj<ContactFormConfirmationEmailProps> = {
  args: ContactFormConfirmationEmail.PreviewProps,
  render: (args) => <EmailPreview email={<ContactFormConfirmationEmail {...args} />} />,
}

/** Sent to the site owner; replying goes straight to the submitter. */
export const Notification: StoryObj<ContactFormNotificationEmailProps> = {
  args: ContactFormNotificationEmail.PreviewProps,
  render: (args) => <EmailPreview email={<ContactFormNotificationEmail {...args} />} />,
}
