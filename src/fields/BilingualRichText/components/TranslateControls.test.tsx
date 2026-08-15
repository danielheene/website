// @vitest-environment jsdom
import type { ComponentProps } from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state: Record<
  string,
  {
    value: unknown
    setValue: ReturnType<typeof vi.fn>
  }
> = {}

const toastErrorMock = vi.fn()
const fetchAnthropicTranslationMock = vi.fn()

vi.mock('@payloadcms/ui', () => ({
  fieldBaseClass: 'field-type',
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
  useField: ({ path }: { path: string }) => state[path],
}))

vi.mock('@/lib/fetchAnthropicTranslation', () => ({
  fetchAnthropicTranslation: (...args: unknown[]) => fetchAnthropicTranslationMock(...args),
  BILINGUAL_LANGUAGE_LABEL: {
    en: 'English',
    de: 'German',
  },
}))

const { TranslateControls } = await import('./TranslateControls')

type Props = ComponentProps<typeof TranslateControls>

const paragraph = (text: string) => ({
  root: {
    children: text
      ? [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text,
              },
            ],
          },
        ]
      : [],
  },
})

const setField = (path: string, value: unknown) => {
  state[path] = {
    value,
    setValue: vi.fn(),
  }
}

const renderControls = () =>
  render(
    <TranslateControls
      {...({
        path: 'task.translateControls',
      } as Props)}
    />,
  )

beforeEach(() => {
  toastErrorMock.mockReset()
  fetchAnthropicTranslationMock.mockReset()
  setField('task.en', paragraph('Hello'))
  setField('task.de', paragraph(''))
})

describe('TranslateControls', () => {
  it('disables the EN→DE button when English is empty', () => {
    setField('task.en', paragraph(''))
    renderControls()

    expect(screen.getByLabelText('Translate English to German')).toBeDisabled()
  })

  it('translates English into German and sets the result', async () => {
    fetchAnthropicTranslationMock.mockResolvedValue(paragraph('Hallo'))
    renderControls()

    fireEvent.click(screen.getByLabelText('Translate English to German'))

    await waitFor(() => {
      expect(state['task.de'].setValue).toHaveBeenCalledWith(paragraph('Hallo'))
    })
    expect(fetchAnthropicTranslationMock).toHaveBeenCalledWith({
      value: paragraph('Hello'),
      sourceLanguage: 'en',
      targetLanguage: 'de',
    })
  })

  it('asks for confirmation before overwriting existing German content, and aborts on cancel', () => {
    setField('task.de', paragraph('Bereits vorhanden'))
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderControls()

    fireEvent.click(screen.getByLabelText('Translate English to German'))

    expect(confirmSpy).toHaveBeenCalledTimes(1)
    expect(fetchAnthropicTranslationMock).not.toHaveBeenCalled()
  })

  it('surfaces a toast and leaves the field untouched when translation fails', async () => {
    fetchAnthropicTranslationMock.mockRejectedValue(new Error('boom'))
    renderControls()

    fireEvent.click(screen.getByLabelText('Translate English to German'))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('boom')
    })
    expect(state['task.de'].setValue).not.toHaveBeenCalled()
  })

  it('surfaces a toast and leaves the target field untouched when translation resolves null (whitespace-only source round-trip)', async () => {
    fetchAnthropicTranslationMock.mockResolvedValue(null)
    renderControls()

    fireEvent.click(screen.getByLabelText('Translate English to German'))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledTimes(1)
    })
    expect(toastErrorMock.mock.calls[0]?.[0]).toMatch(/empty result/i)
    expect(state['task.de'].setValue).not.toHaveBeenCalled()
  })

  it("treats the default single-empty-paragraph shape (Payload's persisted empty value) as empty and disables the button", () => {
    setField('task.en', {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [],
          },
        ],
      },
    })
    renderControls()

    expect(screen.getByLabelText('Translate English to German')).toBeDisabled()
  })
})
