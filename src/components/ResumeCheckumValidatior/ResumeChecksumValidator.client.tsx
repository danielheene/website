'use client'

import { ChangeEvent, DragEvent, useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'

import { sha256 } from 'hash-wasm'
import { cn } from 'tailwind-variants'

import { Banner } from '@/components/Banner'
import { Icon } from '@/components/Icon'
import { track } from '@/lib/umami/track'
import { ResumeDocumentData } from '@/types/payload'

interface ChecksumSearchResult {
  doc: ResumeDocumentData
  newerVersions: number
}

interface ChecksumValidatorClientProps {
  searchChecksum: (checksum: string) => Promise<ChecksumSearchResult | null>
}

type FormState =
  | {
      state: 'INITIAL'
      result: null
    }
  | {
      state: 'LOADING'
      result: null
    }
  | {
      state: 'LOADED'
      result: ChecksumSearchResult | null
    }

type Input =
  | {
      type: 'FILE'
      value: File
    }
  | {
      type: 'HASH'
      value: string
    }

export const ResumeChecksumValidatorClient = ({ searchChecksum }: ChecksumValidatorClientProps) => {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const [{ state, result }, setFormState] = useState<FormState>({
    state: 'INITIAL',
    result: null,
  })

  const [hoverActive, setHoverActive] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [inputLabel, setInputLabel] = useState<string | null>(null)

  const handleDragging = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setHoverActive(true)

    if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      const [item] = Array.from(event.dataTransfer.items)

      if (item.kind === 'file' && item.type === 'application/pdf') {
        return setDragActive(true)
      }
    }

    return setDragActive(false)
  }, [])

  const handleDraggingEnd = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragActive(false)
    setHoverActive(false)
  }, [])

  const validateInput = useCallback(
    async (input: Input): Promise<void> => {
      if (input.type === 'FILE') {
        setInputLabel(input.value.name)
      }

      if (input.type === 'HASH') {
        setInputLabel(input.value)
      }

      setFormState({
        state: 'LOADING',
        result: null,
      })

      let hash: string

      if (input.type === 'FILE') {
        const bytes = await input.value.bytes()
        hash = await sha256(bytes)
      } else if (input.type === 'HASH') {
        hash = input.value
      }

      const result = await searchChecksum(hash)

      setFormState({
        state: 'LOADED',
        result,
      })

      track('resume-validate', {
        checksum: hash,
        newerVersion: result?.newerVersions,
      })
    },
    [searchChecksum],
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault()
      event.stopPropagation()

      const [file] = Array.from(event.dataTransfer.files).filter(
        ({ type }) => type === 'application/pdf',
      )

      if (file) {
        void validateInput({
          type: 'FILE',
          value: file,
        })
      }
    },
    [validateInput],
  )

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const [file] = Array.from(event.target.files)

      if (file) {
        void validateInput({
          type: 'FILE',
          value: file,
        })

        event.target.value = ''
      }
    },
    [validateInput],
  )

  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      if (event.clipboardData.items && event.clipboardData.items.length > 0) {
        const [item] = Array.from(event.clipboardData.items)

        if (item.kind === 'file' && item.type === 'application/pdf') {
          const file = item.getAsFile()

          if (file) {
            void validateInput({
              type: 'FILE',
              value: file,
            })
          }
        }

        if (item.kind === 'string' && item.type === 'text/plain') {
          const [data] = event.clipboardData.getData('text/plain').match(/^[a-fA-F0-9]{64}$/) ?? []

          if (data) {
            void validateInput({
              type: 'HASH',
              value: data,
            })
          }
        }
      }
    },
    [validateInput],
  )

  useEffect(() => {
    window.addEventListener('paste', handlePaste)

    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste])

  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-32">
      <div className="md:w-1/2">
        <label
          htmlFor={id}
          className={cn([
            '[--dropzone-border-color:var(--color-border)]',
            '[--dropzone-text-color:var(--color-foreground)]',
            '[--dropzone-background-color:var(--color-transparent)]',
            hoverActive && [
              '[--dropzone-border-color:color-mix(in_oklch,var(--color-border),var(--color-foreground)_10%)]',
              '[--dropzone-text-color:var(--color-foreground)]',
              '[--dropzone-background-color:color-mix(in_oklch,var(--color-transparent),var(--color-foreground)_2%)]',
            ],
            dragActive && [
              '[--dropzone-border-color:var(--color-primary)]',
              '[--dropzone-text-color:var(--color-primary)]',
              '[--dropzone-background-color:color-mix(in_oklch,var(--color-transparent),var(--color-primary)_15%)]',
            ],
            'border-(--dropzone-border-color) bg-(--dropzone-background-color) text-(--dropzone-text-color)',
            'group relative flex flex-col items-center justify-center gap-3 text-center',
            'aspect-21-9 cursor-pointer rounded-md border-2 border-solid transition-colors',
          ])}
          onPointerEnter={() => setHoverActive(true)}
          onPointerOver={() => setHoverActive(true)}
          onPointerLeave={() => setHoverActive(false)}
          onPointerOut={() => setHoverActive(false)}
          onDragStart={handleDragging}
          onDragEnter={handleDragging}
          onDragOver={handleDragging}
          onDragEnd={handleDraggingEnd}
          onDragLeave={handleDraggingEnd}
          onDrop={handleDrop}
        >
          <Icon
            name={
              state === 'LOADING'
                ? 'material-symbols:progress-activity'
                : 'material-symbols:upload-file-outline'
            }
            className={cn([
              'text-4xl text-muted-foreground transition-colors',
              hoverActive && 'text-foreground',
              dragActive && 'text-primary',
              state === 'LOADING' && 'animate-spin',
            ])}
          />
          <div className="flex flex-col gap-1">
            <span className="font-mono text-sm font-medium tracking-wide text-card-foreground uppercase">
              {state === 'LOADING' ? 'Checking checksum…' : 'Drop a resume PDF here'}
            </span>
            <span className="text-xs text-muted-foreground">
              {state === 'LOADING'
                ? inputLabel
                : 'or click to browse — the file itself never leaves your browser'}
            </span>
          </div>
        </label>
        <input
          id={id}
          type="file"
          accept="application/pdf"
          ref={inputRef}
          onChange={handleChange}
          className="sr-only"
        />
      </div>

      <div className="flex flex-col gap-4 md:w-1/2">
        <p className="text-sm text-muted-foreground md:text-base">
          Every generated PDF gets a SHA-256 checksum — think of it like a fingerprint. Drop a file
          in to check whether its checksum matches one this site has generated.
        </p>
        {state === 'INITIAL' && (
          <p className="text-sm text-muted-foreground md:text-base">
            Your browser computes the file's SHA-256 checksum locally and compares it against every
            resume this site has generated. Only that checksum is sent — never the document itself.
            Full details in the{' '}
            <Link href="/privacy-policy" className="underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
        )}

        {state === 'LOADED' && result && result.newerVersions > 0 && (
          <Banner variant="warning">
            <span className="font-mono">{inputLabel}</span> is valid, but a newer version has since
            been generated.{' '}
            <Link href="/resume/latest" className="underline underline-offset-4">
              Get the latest version
            </Link>
            .
          </Banner>
        )}

        {state === 'LOADED' && result && result.newerVersions === 0 && (
          <Banner variant="success">
            <span className="font-mono">{inputLabel}</span> is valid and it's the latest available
            version.
          </Banner>
        )}

        {state === 'LOADED' && !result && (
          <Banner variant="error">
            <span className="font-mono">{inputLabel}</span> does not match any resume this site has
            generated. Treat it as untrusted.
          </Banner>
        )}
      </div>
    </div>
  )
}
