import { getPayload } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type ContactFormState, submitContactForm } from './submitContactForm'

vi.mock('@payload-config', () => ({
  default: {},
}))

const RECIPIENT_EMAIL = 'owner@example.com'

const findGlobal = vi.fn(async () => ({
  email: RECIPIENT_EMAIL,
}))
const sendEmail = vi.fn(async () => ({}))
const loggerError = vi.fn()

beforeEach(() => {
  findGlobal.mockClear()
  findGlobal.mockResolvedValue({
    email: RECIPIENT_EMAIL,
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
  it('sends an email to the configured recipient with the submitter as reply-to', async () => {
    const result = await submitContactForm(
      initialState,
      formData({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'Hello there',
      }),
    )

    expect(result.status).toBe('success')
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail.mock.calls[0][0]).toMatchObject({
      to: RECIPIENT_EMAIL,
      replyTo: 'Ada Lovelace <ada@example.com>',
      subject: 'New contact form message from Ada Lovelace',
    })
    expect(sendEmail.mock.calls[0][0].text).toContain('Hello there')
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
