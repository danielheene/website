'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { z } from 'zod'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { GlobalSlug } from '@/types/globals'

const ContactFormSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(200),
  email: z.email('Please enter a valid email address.').max(320),
  message: z.string().trim().min(1, 'Please enter a message.').max(5000),
  /**
   * Honeypot field: real visitors never see or fill this input (hidden via
   * CSS), so any non-empty value here means a bot filled the form. Treated
   * as a silent success below rather than surfaced as an error, so bots
   * don't learn their submission was rejected.
   */
  company: z.string().max(200).nullish(),
})

export type ContactFormState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Partial<Record<'name' | 'email' | 'message', string>>
}

export const submitContactForm = async (
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> => {
  const parsed = ContactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
    company: formData.get('company'),
  })

  if (!parsed.success) {
    const fieldErrors: ContactFormState['fieldErrors'] = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (key === 'name' || key === 'email' || key === 'message') {
        fieldErrors[key] = issue.message
      }
    }
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      fieldErrors,
    }
  }

  const { name, email, message, company } = parsed.data

  // Honeypot tripped: report success without sending anything.
  if (company) {
    return {
      status: 'success',
    }
  }

  try {
    const payload = await getPayload({
      config,
    })

    const { email: recipientEmail } = await payload.findGlobal({
      slug: GlobalSlug.GlobalUserSettings,
      draft: false,
    })

    if (!recipientEmail) {
      payload.logger.error('Contact form submitted but no recipient email is configured.')
      return {
        status: 'error',
        message: 'Sorry, the contact form is currently unavailable. Please try again later.',
      }
    }

    await payload.sendEmail({
      to: recipientEmail,
      replyTo: `${name} <${email}>`,
      subject: `New contact form message from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        '',
        message,
      ].join('\n'),
    })

    return {
      status: 'success',
    }
  } catch (error) {
    const payload = await getPayload({
      config,
    })
    payload.logger.error(`Failed to send contact form email: ${extractErrorMessage(error)}`)

    return {
      status: 'error',
      message: 'Sorry, something went wrong sending your message. Please try again later.',
    }
  }
}
