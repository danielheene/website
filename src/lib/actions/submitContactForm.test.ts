import type { SendEmailOptions } from 'payload'
import { getPayload } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type ContactFormState, submitContactForm } from './submitContactForm'

vi.mock('@payload-config', () => ({
  default: {},
}))

const RECIPIENT_EMAIL = 'owner@example.com'
const OWNER_FIRST_NAME = 'Daniel'

const findGlobal = vi.fn(
  async (): Promise<{
    email?: string
    firstName?: string
  }> => ({
    email: RECIPIENT_EMAIL,
    firstName: OWNER_FIRST_NAME,
  }),
)
const sendEmail = vi.fn(async (_options: SendEmailOptions) => ({}))
const loggerError = vi.fn()

beforeEach(() => {
  findGlobal.mockClear()
  findGlobal.mockResolvedValue({
    email: RECIPIENT_EMAIL,
    firstName: OWNER_FIRST_NAME,
  })
  sendEmail.mockClear()
  sendEmail.mockResolvedValue({})
  loggerError.mockClear()

  vi.mocked(getPayload).mockResolvedValue({
    findGlobal,
    sendEmail,
    logger: {
      info: vi.fn(),
      error: loggerError,
    },
  } as never)
})

const initialState: ContactFormState = {
  status: 'idle',
}

const formData = (fields: Partial<Record<'name' | 'email' | 'message' | 'company', string>>) => {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      data.set(key, value)
    }
  }
  return data
}

describe('submitContactForm', () => {
  it('notifies the configured recipient with the submitter as reply-to, and sends the submitter a copy', async () => {
    const result = await submitContactForm(
      initialState,
      formData({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'Hello there',
      }),
    )

    expect(result.status).toBe('success')
    expect(sendEmail).toHaveBeenCalledTimes(2)

    const [notificationCall, confirmationCall] = sendEmail.mock.calls

    expect(notificationCall?.[0]).toMatchObject({
      to: RECIPIENT_EMAIL,
      replyTo: 'Ada Lovelace <ada@example.com>',
      subject: 'New contact form message from Ada Lovelace',
    })
    expect(notificationCall?.[0].text).toContain('Hello there')
    expect(notificationCall?.[0].html).toContain('Hello there')

    expect(confirmationCall?.[0]).toMatchObject({
      to: 'Ada Lovelace <ada@example.com>',
      replyTo: RECIPIENT_EMAIL,
    })
    expect(confirmationCall?.[0].text).toContain('Hello there')
    expect(confirmationCall?.[0].html).toContain('Hello there')
  })

  it('still reports success when only the confirmation copy fails to send', async () => {
    sendEmail.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('usesend: 500'))

    const result = await submitContactForm(
      initialState,
      formData({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'Hello there',
      }),
    )

    expect(result.status).toBe('success')
    expect(sendEmail).toHaveBeenCalledTimes(2)
    expect(loggerError).toHaveBeenCalledWith(expect.stringContaining('confirmation'))
  })

  it('rejects an invalid email without sending', async () => {
    const result = await submitContactForm(
      initialState,
      formData({
        name: 'Ada',
        email: 'not-an-email',
        message: 'Hi',
      }),
    )

    expect(result.status).toBe('error')
    expect(result.fieldErrors?.email).toBeTruthy()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('rejects an empty message without sending', async () => {
    const result = await submitContactForm(
      initialState,
      formData({
        name: 'Ada',
        email: 'ada@example.com',
        message: '   ',
      }),
    )

    expect(result.status).toBe('error')
    expect(result.fieldErrors?.message).toBeTruthy()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('silently succeeds without sending when the honeypot field is filled', async () => {
    const result = await submitContactForm(
      initialState,
      formData({
        name: 'Bot',
        email: 'bot@example.com',
        message: 'buy now',
        company: 'Acme Spam Co',
      }),
    )

    expect(result.status).toBe('success')
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('reports an error without leaking details when no recipient email is configured', async () => {
    findGlobal.mockResolvedValue({
      email: undefined,
    })

    const result = await submitContactForm(
      initialState,
      formData({
        name: 'Ada',
        email: 'ada@example.com',
        message: 'Hi',
      }),
    )

    expect(result.status).toBe('error')
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('reports a generic error and logs details when sending fails', async () => {
    sendEmail.mockRejectedValue(new Error('usesend: 500 upstream error'))

    const result = await submitContactForm(
      initialState,
      formData({
        name: 'Ada',
        email: 'ada@example.com',
        message: 'Hi',
      }),
    )

    expect(result.status).toBe('error')
    expect(result.message).not.toContain('usesend')
    expect(loggerError).toHaveBeenCalledWith(expect.stringContaining('usesend: 500 upstream error'))
  })
})
