'use client'

import { ChangeEvent, DragEvent, useCallback, useId, useRef, useState } from 'react'
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

export const ResumeChecksumValidatorClient = ({ searchChecksum }: ChecksumValidatorClientProps) => {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [{ state, result }, setFormState] = useState<FormState>({
    state: 'INITIAL',
    result: null,
  })
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleDragEnter = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDraggingOver(true)
  }, [])

  const handleDragOver = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
  }, [])

  const handleDragLeave = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDraggingOver(false)
  }, [])

  const validateProvidedFile = useCallback(
    (file: File | undefined) => {
      if (!file) return

      ;(async () => {
        setFileName(file.name)
        setFormState({
          state: 'LOADING',
          result: null,
        })

        const bytes = await file.bytes()
        const hash = await sha256(bytes)
        const result = await searchChecksum(hash)

        setFormState({
          state: 'LOADED',
          result,
        })
        track('resume-validate', {
          checksum: hash,
          newerVersion: result?.newerVersions,
        })
      })()
    },
    [
      searchChecksum,
    ],
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault()
      setIsDraggingOver(false)
      validateProvidedFile(event.dataTransfer.files[0])
    },
    [
      validateProvidedFile,
    ],
  )

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      validateProvidedFile(event.target.files?.[0])
    },
    [
      validateProvidedFile,
    ],
  )

  const reset = useCallback(() => {
    setFileName(null)
    setFormState({
      state: 'INITIAL',
      result: null,
    })
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-32">
      <div className="md:w-1/2">
        <label
          htmlFor={id}
          className={cn([
            'group relative flex h-56 cursor-pointer flex-col items-center justify-center gap-3 text-center',
            'border-2 border-dashed transition-colors',
            isDraggingOver
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card hover:border-foreground/40',
          ])}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
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
              'group-hover:text-foreground',
              isDraggingOver && 'text-primary',
              state === 'LOADING' && 'animate-spin',
            ])}
          />
          <div className="flex flex-col gap-1">
            <span className="font-mono text-sm font-medium uppercase tracking-wide text-card-foreground">
              {state === 'LOADING' ? 'Checking checksum…' : 'Drop a resume PDF here'}
            </span>
            <span className="text-xs text-muted-foreground">
              {state === 'LOADING'
                ? fileName
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
        {state === 'LOADING' && (
          <p className="font-mono text-sm text-muted-foreground md:text-base">
            Hashing “{fileName}”…
          </p>
        )}
        {state === 'LOADED' && result && result.newerVersions > 0 && (
          <Banner variant="warning">
            <span className="font-mono">{fileName}</span> is authentic, but a newer version has
            since been generated.{' '}
            <Link href="/resume/latest" className="underline underline-offset-4">
              Get the latest version
            </Link>
            .
          </Banner>
        )}
        {state === 'LOADED' && result && result.newerVersions === 0 && (
          <Banner variant="success">
            <span className="font-mono">{fileName}</span> is authentic and it's the latest available
            version.
          </Banner>
        )}
        {state === 'LOADED' && !result && (
          <Banner variant="error">
            <span className="font-mono">{fileName}</span> does not match any resume this site has
            generated. Treat it as untrusted.
          </Banner>
        )}
        {state === 'LOADED' && (
          <button
            type="button"
            onClick={reset}
            className="self-start text-xs uppercase tracking-wide text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Check another file
          </button>
        )}
      </div>
    </div>
  )
}
