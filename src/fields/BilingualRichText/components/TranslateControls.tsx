'use client'

import { useCallback, useState } from 'react'
import type { UIFieldClientComponent, UIFieldClientProps } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  ConfirmationModal,
  fieldBaseClass,
  toast,
  useDocumentInfo,
  useField,
  useModal,
} from '@payloadcms/ui'

import { Button } from '@/components/Button'
import { useServerSentEvents } from '@/components/hooks/use-server-sent-events'
import { Icon } from '@/components/Icon'
import { enqueueBilingualTranslation } from '@/lib/actions/enqueueBilingualTranslation'
import { cn } from '@/lib/cn'
import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import type { AutoTranslateBilingualFieldProgress } from '@/lib/sse/channels'
import { bilingualTranslateChannel } from '@/lib/sse/channels'
import type { BilingualLanguageValue } from '@/types/bilingualLanguage'
import { BilingualLanguage, BilingualLanguageLabel } from '@/types/bilingualLanguage'

/** Swaps the last path segment for `name`, e.g. `task.controls` -> `task.en`. */
const siblingPath = (path: string, name: string): string => {
  const segments = path.split('.')
  segments[segments.length - 1] = name
  return segments.join('.')
}

/** Drops the last path segment, e.g. `task.controls` -> `task` — the path of
 * the BilingualRichTextField group itself, which is what the background job
 * needs to locate `en`/`de` inside the saved document. */
const groupPath = (path: string): string => {
  const segments = path.split('.')
  segments.pop()
  return segments.join('.')
}

type SkippedReason = Extract<
  AutoTranslateBilingualFieldProgress,
  {
    status: 'skipped'
  }
>['reason']

const SKIP_TOAST_MESSAGE: Record<SkippedReason, string> = {
  'no-doc-id': 'Save the document before translating.',
  'target-already-populated': 'That field was already filled in — nothing to do.',
  'empty-translation':
    'Translation returned an empty result — the source content may not contain translatable text.',
}

type TranslateControlsProps = {
  layout?: 'row' | 'column'
} & UIFieldClientProps

export const TranslateControls: UIFieldClientComponent = ({
  path,
  layout,
}: TranslateControlsProps) => {
  const { value: enValue, setValue: setEnValue } = useField<SerializedEditorState>({
    path: siblingPath(path, 'en'),
  })
  const { value: deValue, setValue: setDeValue } = useField<SerializedEditorState>({
    path: siblingPath(path, 'de'),
  })

  const { id: docId, collectionSlug } = useDocumentInfo()
  const { openModal } = useModal()

  const [isTranslatingToDe, setIsTranslatingToDe] = useState(false)
  const [isTranslatingToEn, setIsTranslatingToEn] = useState(false)
  const [jobIdToDe, setJobIdToDe] = useState<string | null>(null)
  const [jobIdToEn, setJobIdToEn] = useState<string | null>(null)

  /** Queues the background translation and immediately triggers it to run,
   * then starts tracking its job id so the SSE effects below pick it up. */
  const runTranslate = useCallback(
    async (
      source: BilingualLanguageValue,
      target: BilingualLanguageValue,
      sourceValue: SerializedEditorState | undefined,
      setIsTranslating: (value: boolean) => void,
      setJobId: (value: string | null) => void,
    ) => {
      if (!sourceValue || isEmptyValue(sourceValue)) return

      setIsTranslating(true)
      const title = `Translating ${BilingualLanguageLabel[source]} to ${BilingualLanguageLabel[target]}`

      try {
        const { jobId } = await enqueueBilingualTranslation({
          collectionSlug: collectionSlug ?? '',
          docId: docId === undefined || docId === null ? undefined : String(docId),
          path: groupPath(path),
          sourceLanguage: source,
          targetLanguage: target,
          sourceValue,
        })

        setJobId(jobId)
        toast.loading(title, {
          id: jobId,
          description: 'Queued…',
        })
      } catch (error) {
        setIsTranslating(false)
        toast.error(extractErrorMessage(error))
      }
    },
    [
      collectionSlug,
      docId,
      path,
    ],
  )

  const translate = useCallback(
    (
      source: BilingualLanguageValue,
      target: BilingualLanguageValue,
      sourceValue: SerializedEditorState | undefined,
      targetValue: SerializedEditorState | undefined,
      setIsTranslating: (value: boolean) => void,
      setJobId: (value: string | null) => void,
      confirmModalSlug: string,
    ) => {
      if (!sourceValue || isEmptyValue(sourceValue)) return

      if (!isEmptyValue(targetValue)) {
        openModal(confirmModalSlug)
        return
      }

      void runTranslate(source, target, sourceValue, setIsTranslating, setJobId)
    },
    [
      openModal,
      runTranslate,
    ],
  )

  /** Builds the SSE `onMessage` handler for one direction: keeps the toast
   * (matched by job id) live as progress comes in, applies the result on
   * success, and releases the translating/job-id state on every outcome. */
  const handleProgress = useCallback(
    (
      target: BilingualLanguageValue,
      setTargetValue: (value: SerializedEditorState) => void,
      setIsTranslating: (value: boolean) => void,
      setJobId: (value: string | null) => void,
      jobId: string,
    ) =>
      (data: AutoTranslateBilingualFieldProgress) => {
        switch (data.status) {
          case 'progress':
            toast.loading(`Translating to ${BilingualLanguageLabel[target]}`, {
              id: jobId,
              description: data.message,
            })
            return
          case 'success':
            setTargetValue(data.translated)
            toast.success(`Translated to ${BilingualLanguageLabel[target]}`, {
              id: jobId,
            })
            setIsTranslating(false)
            setJobId(null)
            return
          case 'skipped':
            toast.error(SKIP_TOAST_MESSAGE[data.reason], {
              id: jobId,
            })
            setIsTranslating(false)
            setJobId(null)
            return
          case 'error':
            toast.error(data.message, {
              id: jobId,
            })
            setIsTranslating(false)
            setJobId(null)
        }
      },
    [],
  )

  useServerSentEvents<AutoTranslateBilingualFieldProgress>({
    channel: jobIdToDe ? bilingualTranslateChannel(jobIdToDe) : '',
    enabled: Boolean(jobIdToDe),
    onMessage: jobIdToDe
      ? handleProgress(
          BilingualLanguage.German,
          setDeValue,
          setIsTranslatingToDe,
          setJobIdToDe,
          jobIdToDe,
        )
      : undefined,
  })

  useServerSentEvents<AutoTranslateBilingualFieldProgress>({
    channel: jobIdToEn ? bilingualTranslateChannel(jobIdToEn) : '',
    enabled: Boolean(jobIdToEn),
    onMessage: jobIdToEn
      ? handleProgress(
          BilingualLanguage.English,
          setEnValue,
          setIsTranslatingToEn,
          setJobIdToEn,
          jobIdToEn,
        )
      : undefined,
  })

  const confirmEnToDeSlug = `${path}-confirm-en-de`
  const confirmDeToEnSlug = `${path}-confirm-de-en`

  return (
    <div
      className={cn([
        fieldBaseClass,
        'bilingual-rich-text-translate-controls',
        'flex flex-row gap-1.5 items-center justify-center',
        layout === 'row' && 'md:flex-col',
      ])}
    >
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        className="basis-1/2 grow shrink"
        aria-label={`Translate ${BilingualLanguageLabel[BilingualLanguage.English]} to ${BilingualLanguageLabel[BilingualLanguage.German]}`}
        disabled={isEmptyValue(enValue) || isTranslatingToDe}
        onClick={() =>
          translate(
            BilingualLanguage.English,
            BilingualLanguage.German,
            enValue,
            deValue,
            setIsTranslatingToDe,
            setJobIdToDe,
            confirmEnToDeSlug,
          )
        }
      >
        <Icon name="material-symbols:arrow-right-alt-rounded" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        className="basis-1/2 grow shrink"
        aria-label={`Translate ${BilingualLanguageLabel[BilingualLanguage.German]} to ${BilingualLanguageLabel[BilingualLanguage.English]}`}
        disabled={isEmptyValue(deValue) || isTranslatingToEn}
        onClick={() =>
          translate(
            BilingualLanguage.German,
            BilingualLanguage.English,
            deValue,
            enValue,
            setIsTranslatingToEn,
            setJobIdToEn,
            confirmDeToEnSlug,
          )
        }
      >
        <Icon name="material-symbols:arrow-left-alt-rounded" />
      </Button>

      <ConfirmationModal
        modalSlug={confirmEnToDeSlug}
        heading={`Replace ${BilingualLanguageLabel[BilingualLanguage.German]} content?`}
        body={`Replace the ${BilingualLanguageLabel[BilingualLanguage.German]} content with a translation from ${BilingualLanguageLabel[BilingualLanguage.English]}?`}
        confirmLabel="Replace"
        cancelLabel="Cancel"
        onConfirm={() =>
          runTranslate(
            BilingualLanguage.English,
            BilingualLanguage.German,
            enValue,
            setIsTranslatingToDe,
            setJobIdToDe,
          )
        }
      />
      <ConfirmationModal
        modalSlug={confirmDeToEnSlug}
        heading={`Replace ${BilingualLanguageLabel[BilingualLanguage.English]} content?`}
        body={`Replace the ${BilingualLanguageLabel[BilingualLanguage.English]} content with a translation from ${BilingualLanguageLabel[BilingualLanguage.German]}?`}
        confirmLabel="Replace"
        cancelLabel="Cancel"
        onConfirm={() =>
          runTranslate(
            BilingualLanguage.German,
            BilingualLanguage.English,
            deValue,
            setIsTranslatingToEn,
            setJobIdToEn,
          )
        }
      />
    </div>
  )
}

export default TranslateControls
