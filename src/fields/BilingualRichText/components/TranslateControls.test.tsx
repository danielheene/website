// @vitest-environment jsdom
import type { ComponentProps } from 'react'

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state: Record<
  string,
  {
    value: unknown
    setValue: ReturnType<typeof vi.fn>
  }
> = {}

const toastLoadingMock = vi.fn()
const toastSuccessMock = vi.fn()
const toastErrorMock = vi.fn()
const openModalMock = vi.fn()
const enqueueBilingualTranslationMock = vi.fn()
const documentInfoMock = vi.fn(() => ({
  id: undefined as string | undefined,
  collectionSlug: undefined as string | undefined,
}))

type SseCall = {
  channel: string
  enabled?: boolean
  onMessage?: (data: unknown) => void
}
const sseCalls: SseCall[] = []

vi.mock('@payloadcms/ui', () => ({
  fieldBaseClass: 'field-type',
  toast: {
    loading: (...args: unknown[]) => toastLoadingMock(...args),
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
  useField: ({ path }: { path: string }) => state[path],
  useDocumentInfo: () => documentInfoMock(),
  useModal: () => ({
    openModal: openModalMock,
  }),
  ConfirmationModal: ({
    modalSlug,
    heading,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
  }: {
    modalSlug: string
    heading: React.ReactNode
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel?: () => void
  }) => (
    <div data-testid={`modal-${modalSlug}`}>
      <span>{heading}</span>
      <button type="button" onClick={onConfirm}>
        {confirmLabel ?? 'Confirm'}
      </button>
      <button type="button" onClick={onCancel}>
        {cancelLabel ?? 'Cancel'}
      </button>
    </div>
  ),
}))

vi.mock('@/lib/actions/enqueueBilingualTranslation', () => ({
  enqueueBilingualTranslation: (...args: unknown[]) => enqueueBilingualTranslationMock(...args),
}))

vi.mock('@/components/hooks/use-server-sent-events', () => ({
  useServerSentEvents: (opts: SseCall) => {
    sseCalls.push(opts)
    return {
      data: null,
      status: 'closed',
      error: null,
      reconnect: vi.fn(),
    }
  },
}))

const { TranslateControls } = await import('./TranslateControls')
const { bilingualTranslateChannel } = await import('@/lib/sse/channels')

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

/** Finds the onMessage handler registered for a given job's SSE channel,
 * waiting for the render triggered by `setJobId` to have happened. */
const onMessageFor = async (jobId: string) => {
  await waitFor(() => {
    const call = [
      ...sseCalls,
    ]
      .reverse()
      .find((c) => c.channel === bilingualTranslateChannel(jobId) && c.onMessage)
    expect(call).toBeDefined()
  })

  const call = [
    ...sseCalls,
  ]
    .reverse()
    .find((c) => c.channel === bilingualTranslateChannel(jobId))
  return call?.onMessage as (data: unknown) => void
}

beforeEach(() => {
  toastLoadingMock.mockReset()
  toastSuccessMock.mockReset()
  toastErrorMock.mockReset()
  openModalMock.mockReset()
  enqueueBilingualTranslationMock.mockReset()
  documentInfoMock.mockReset()
  documentInfoMock.mockReturnValue({
    id: undefined,
    collectionSlug: undefined,
  })
  sseCalls.length = 0

  setField('task.en', paragraph('Hello'))
  setField('task.de', paragraph(''))
})

describe('TranslateControls', () => {
  it('disables the EN→DE button when English is empty', () => {
    setField('task.en', paragraph(''))
    renderControls()

    expect(screen.getByLabelText('Translate English to German')).toBeDisabled()
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

  it('queues a translation directly (no modal) when the target is empty, and shows a loading toast', async () => {
    documentInfoMock.mockReturnValue({
      id: 'doc-1',
      collectionSlug: 'resume-jobs',
    })
    enqueueBilingualTranslationMock.mockResolvedValue({
      jobId: 'job-1',
    })
    renderControls()

    fireEvent.click(screen.getByLabelText('Translate English to German'))

    await waitFor(() => {
      expect(enqueueBilingualTranslationMock).toHaveBeenCalledWith({
        collectionSlug: 'resume-jobs',
        docId: 'doc-1',
        path: 'task',
        sourceLanguage: 'en',
        targetLanguage: 'de',
        sourceValue: paragraph('Hello'),
      })
    })
    expect(openModalMock).not.toHaveBeenCalled()
    expect(toastLoadingMock).toHaveBeenCalledWith(
      'Translating English to German',
      expect.objectContaining({
        id: 'job-1',
      }),
    )
    expect(screen.getByLabelText('Translate English to German')).toBeDisabled()
  })

  it('opens the real confirmation modal instead of window.confirm before overwriting existing content', async () => {
    setField('task.de', paragraph('Bereits vorhanden'))
    renderControls()

    fireEvent.click(screen.getByLabelText('Translate English to German'))

    expect(openModalMock).toHaveBeenCalledWith('task.translateControls-confirm-en-de')
    expect(enqueueBilingualTranslationMock).not.toHaveBeenCalled()
    expect(screen.queryByText('window.confirm')).not.toBeInTheDocument()
  })

  it('proceeds with the translation once the confirmation modal is confirmed', async () => {
    setField('task.de', paragraph('Bereits vorhanden'))
    enqueueBilingualTranslationMock.mockResolvedValue({
      jobId: 'job-1',
    })
    renderControls()

    fireEvent.click(screen.getByLabelText('Translate English to German'))
    const [confirmButton] = within(
      screen.getByTestId('modal-task.translateControls-confirm-en-de'),
    ).getAllByRole('button')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(enqueueBilingualTranslationMock).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceLanguage: 'en',
          targetLanguage: 'de',
        }),
      )
    })
  })

  it('applies the translated value and shows a success toast when the job completes', async () => {
    enqueueBilingualTranslationMock.mockResolvedValue({
      jobId: 'job-1',
    })
    renderControls()

    fireEvent.click(screen.getByLabelText('Translate English to German'))
    const onMessage = await onMessageFor('job-1')

    onMessage({
      status: 'success',
      translated: paragraph('Hallo'),
    })

    expect(state['task.de'].setValue).toHaveBeenCalledWith(paragraph('Hallo'))
    expect(toastSuccessMock).toHaveBeenCalledWith(
      'Translated to German',
      expect.objectContaining({
        id: 'job-1',
      }),
    )
    await waitFor(() => {
      expect(screen.getByLabelText('Translate English to German')).not.toBeDisabled()
    })
  })

  it('updates the same toast as progress messages stream in over SSE', async () => {
    enqueueBilingualTranslationMock.mockResolvedValue({
      jobId: 'job-1',
    })
    renderControls()

    fireEvent.click(screen.getByLabelText('Translate English to German'))
    const onMessage = await onMessageFor('job-1')

    onMessage({
      status: 'progress',
      message: 'Calling Claude…',
    })

    expect(toastLoadingMock).toHaveBeenLastCalledWith('Translating to German', {
      id: 'job-1',
      description: 'Calling Claude…',
    })
  })

  it('surfaces a toast and leaves the field untouched when the job reports an error', async () => {
    enqueueBilingualTranslationMock.mockResolvedValue({
      jobId: 'job-1',
    })
    renderControls()

    fireEvent.click(screen.getByLabelText('Translate English to German'))
    const onMessage = await onMessageFor('job-1')

    onMessage({
      status: 'error',
      message: 'boom',
    })

    expect(toastErrorMock).toHaveBeenCalledWith(
      'boom',
      expect.objectContaining({
        id: 'job-1',
      }),
    )
    expect(state['task.de'].setValue).not.toHaveBeenCalled()
  })

  it('surfaces a friendly toast and leaves the field untouched when the job reports an empty translation', async () => {
    enqueueBilingualTranslationMock.mockResolvedValue({
      jobId: 'job-1',
    })
    renderControls()

    fireEvent.click(screen.getByLabelText('Translate English to German'))
    const onMessage = await onMessageFor('job-1')

    onMessage({
      status: 'skipped',
      reason: 'empty-translation',
    })

    expect(toastErrorMock).toHaveBeenCalledWith(
      expect.stringMatching(/empty result/i),
      expect.objectContaining({
        id: 'job-1',
      }),
    )
    expect(state['task.de'].setValue).not.toHaveBeenCalled()
  })

  it('surfaces a toast and leaves the field untouched when enqueueing itself fails', async () => {
    enqueueBilingualTranslationMock.mockRejectedValue(new Error('queue unavailable'))
    renderControls()

    fireEvent.click(screen.getByLabelText('Translate English to German'))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('queue unavailable')
    })
    expect(state['task.de'].setValue).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(screen.getByLabelText('Translate English to German')).not.toBeDisabled()
    })
  })
})
