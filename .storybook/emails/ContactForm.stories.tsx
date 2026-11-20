import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ContactFormConfirmationEmail } from '@/emails/ContactFormConfirmationEmail'
import { ContactFormNotificationEmail } from '@/emails/ContactFormNotificationEmail'

import { EmailPreview } from './EmailPreview'

const meta = {
  title: 'Contact Form',
  component: EmailPreview,
  parameters: {
    layout: 'padded',
  },
  tags: ['!autodocs'],
  argTypes: {
    email: {
      table: {
        disable: true,
      },
    },
    format: {
      control: 'inline-radio',
      options: ['html', 'text'],
    },
    width: {
      control: {
        type: 'range',
        min: 320,
        max: 900,
        step: 10,
      },
    },
  },
  args: {
    format: 'html',
    width: 640,
    email: <ContactFormConfirmationEmail {...ContactFormConfirmationEmail.PreviewProps} />,
  },
} satisfies Meta<typeof EmailPreview>

export default meta

type Story = StoryObj<typeof meta>

/** Sent to whoever submitted the contact form. */
export const Confirmation: Story = {}

/** Sent to the site owner; replying goes straight to the submitter. */
export const Notification: Story = {
  args: {
    email: <ContactFormNotificationEmail {...ContactFormNotificationEmail.PreviewProps} />,
  },
}

/** Without the owner's first name, the greeting falls back to a neutral one. */
export const NotificationWithoutOwnerName: Story = {
  args: {
    email: (
      <ContactFormNotificationEmail
        {...ContactFormNotificationEmail.PreviewProps}
        ownerFirstName={undefined}
      />
    ),
  },
}

export const PlainText: Story = {
  args: {
    format: 'text',
  },
}
