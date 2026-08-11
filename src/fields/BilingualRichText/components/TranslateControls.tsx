'use client'

import { useCallback, useState } from 'react'
import type { UIFieldClientComponent } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { fieldBaseClass, toast, useField } from '@payloadcms/ui'

import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { cn } from '@/lib/cn'
import { extractErrorMessage } from '@/lib/extractErrorMessage'
import {
  BILINGUAL_LANGUAGE_LABEL,
  BilingualLanguage,
  fetchAnthropicTranslation,
} from '@/lib/fetchAnthropicTranslation'

const isEmptyValue = (value: SerializedEditorState | undefined): boolean => {
  const children = (
    value?.root as
      | {
          children?: unknown[]
        }
      | undefined
  )?.children
  if (!children || children.length === 0) return true
  if (children.length > 1) return false
  const [onlyChild] = children as Array<{
    children?: unknown[]
  }>
  return !onlyChild.children || onlyChild.children.length === 0
}

/** Swaps the last path segment for `name`, e.g. `task.controls` -> `task.en`. */
const siblingPath = (path: string, name: string): string => {
  const segments = path.split('.')
  segments[segments.length - 1] = name
  return segments.join('.')
}

export const TranslateControls: UIFieldClientComponent = ({ path }) => {
  const { value: enValue, setValue: setEnValue } = useField<SerializedEditorState>({
    path: siblingPath(path, 'en'),
  })
  const { value: deValue, setValue: setDeValue } = useField<SerializedEditorState>({
    path: siblingPath(path, 'de'),
  })

  const [isTranslatingToDe, setIsTranslatingToDe] = useState(false)
  const [isTranslatingToEn, setIsTranslatingToEn] = useState(false)

  const translate = useCallback(
    async (
      sourceLanguage: BilingualLanguage,
      targetLanguage: BilingualLanguage,
      sourceValue: SerializedEditorState | undefined,
      targetValue: SerializedEditorState | undefined,
      setTargetValue: (value: SerializedEditorState) => void,
      setIsTranslating: (value: boolean) => void,
    ) => {
      if (!sourceValue || isEmptyValue(sourceValue)) return

      if (!isEmptyValue(targetValue)) {
        const confirmed = window.confirm(
          `Replace the ${BILINGUAL_LANGUAGE_LABEL[targetLanguage]} content with a translation from ${BILINGUAL_LANGUAGE_LABEL[sourceLanguage]}?`,
        )
        if (!confirmed) return
      }

      setIsTranslating(true)
      try {
        const translated = await fetchAnthropicTranslation({
          value: sourceValue,
          sourceLanguage,
          targetLanguage,
        })
        if (translated) setTargetValue(translated)
      } catch (error) {
        toast.error(extractErrorMessage(error))
      } finally {
        setIsTranslating(false)
      }
    },
    [],
  )

  return (
    <div
      className={cn([
        fieldBaseClass,
        'bilingual-rich-text-translate-controls',
        'flex flex-col gap-1.5 items-center justify-center',
      ])}
    >
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        aria-label={`Translate ${BILINGUAL_LANGUAGE_LABEL.en} to ${BILINGUAL_LANGUAGE_LABEL.de}`}
        disabled={isEmptyValue(enValue) || isTranslatingToDe}
        onClick={() => translate('en', 'de', enValue, deValue, setDeValue, setIsTranslatingToDe)}
      >
        <Icon name="material-symbols:arrow-right-alt-rounded" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        aria-label={`Translate ${BILINGUAL_LANGUAGE_LABEL.de} to ${BILINGUAL_LANGUAGE_LABEL.en}`}
        disabled={isEmptyValue(deValue) || isTranslatingToEn}
        onClick={() => translate('de', 'en', deValue, enValue, setEnValue, setIsTranslatingToEn)}
      >
        <Icon name="material-symbols:arrow-left-alt-rounded" />
      </Button>
    </div>
  )
}

export default TranslateControls
