'use client'

import { useEffect, useMemo, useRef } from 'react'
import { CodeFieldClientComponent } from 'payload'
import { CodeField, useFormFields } from '@payloadcms/ui'

import type { Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

import type { SupportedLanguage } from '@/lib/shiki'

import { toMonacoLanguage } from './monacoLanguage'

/**
 * Sync Monaco's language to the sibling `language` select field
 *
 * Payload's `code` field only takes a static `admin.language`, fixed at
 * mount. Reads the sibling field live via `useFormFields` and calls
 * `monaco.editor.setModelLanguage` on change, since `admin.language` only
 * resolves `defaultLanguage`, which doesn't react to later updates.
 */
export const CodeFieldComponent: CodeFieldClientComponent = (props) => {
  const { field, path, onMount } = props

  const languagePath = path.replace(/\.code$/, '.language')
  const siblingLanguage = useFormFields(([fields]) => fields?.[languagePath]?.value) as
    | SupportedLanguage
    | undefined
  const monacoLanguage = siblingLanguage ? toMonacoLanguage(siblingLanguage) : undefined

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)

  useEffect(() => {
    const currentEditor = editorRef.current
    const monaco = monacoRef.current
    const model = currentEditor?.getModel()
    if (!model || !monaco || !monacoLanguage) {
      return
    }
    monaco.editor.setModelLanguage(model, monacoLanguage)
  }, [monacoLanguage])

  const fieldWithResolvedLanguage = useMemo(
    () => ({
      ...field,
      admin: {
        ...field.admin,
        language: monacoLanguage ?? field.admin?.language,
      },
    }),
    [field, monacoLanguage],
  )

  return (
    <CodeField
      {...props}
      field={fieldWithResolvedLanguage}
      onMount={(mountedEditor, monaco) => {
        editorRef.current = mountedEditor
        monacoRef.current = monaco
        onMount?.(mountedEditor, monaco)
      }}
    />
  )
}
