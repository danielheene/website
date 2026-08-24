'use client'

import { ChangeEvent, DragEvent, useCallback, useId, useRef, useState } from 'react'

import { sha256 } from 'hash-wasm'
import { cn } from 'tailwind-variants'

import { Banner } from '@/components/Banner'
import { ResumeDocumentData } from '@/types/payload'

interface ChecksumValidatorClientProps {
  searchChecksum: (checksum: string) => Promise<ResumeDocumentData | null>
}

type FormState =
  | {
      state: 'INITIAL'
      doc: null
    }
  | {
      state: 'LOADING'
      doc: null
    }
  | {
      state: 'LOADED'
      doc: ResumeDocumentData | null
    }

export const ResumeChecksumValidatorClient = ({ searchChecksum }: ChecksumValidatorClientProps) => {
  const id = useId()
  const inputRef = useRef(null)
  const [{ state, doc }, setFormState] = useState<FormState>({
    state: 'INITIAL',
    doc: null,
  })

  const handleDragEnter = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
  }, [])

  const handleDragStart = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
  }, [])

  const handleDragOver = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
  }, [])

  const handleDragLeave = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
  }, [])

  const validateProvidedFile = useCallback(
    (file: File) => {
      ;(async () => {
        setFormState({
          state: 'LOADING',
          doc: null,
        })

        const bytes = await file.bytes()
        const hash = await sha256(bytes)
        const doc = await searchChecksum(hash)

        setFormState({
          state: 'LOADED',
          doc: doc,
        })
        if (!doc) return
        if (doc && doc.newerVersions > 0) return

        console.log(file)
      })()
    },
    [
      searchChecksum,
    ],
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault()

      const file = event.dataTransfer.files[0]
      validateProvidedFile(file)
    },
    [
      validateProvidedFile,
    ],
  )

  const handleChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()

      const file = event.target.files[0]
      validateProvidedFile(file)
    },
    [
      validateProvidedFile,
    ],
  )

  //
  // useEffect(() => {
  //   window.addEventListener('dragover', (ev) => ev.preventDefault())
  //   window.addEventListener('dragend', (ev) => ev.preventDefault())
  //   window.addEventListener('drop', (ev) => ev.preventDefault())
  // }, [
  //   handleDragEnter,
  // ])

  return (
    <div className="container grid grid-cols-12 gap-4">
      <div
        className={cn([
          'col-start-1 col-end-5',
        ])}
      >
        {state === 'INITIAL' && <p>Drag and drop a resume file here</p>}
        {state === 'LOADING' && <p>Loading...</p>}
        {state === 'LOADED' && doc && doc.newerVersions > 0 && (
          <Banner variant="warning">
            It's a valid document but there is a newer version available.
          </Banner>
        )}
        {state === 'LOADED' && doc && doc.newerVersions === 0 && (
          <Banner variant="success">
            It's a valid document and it's the latest available version.
          </Banner>
        )}
        {state === 'LOADED' && !doc && (
          <Banner variant="error">
            The provided document is no resume or it has been compromised.
            <br />
            This means, the version you provided is not known to the system.
          </Banner>
        )}
      </div>
      <div
        className={cn([
          'col-start-6 col-end-12',
        ])}
      >
        <label
          htmlFor={id}
          className={cn([
            'cursor-pointer',
            'w-full h-30 block',
            'bg-accent text-accent-foreground',
            'border-2 inset-0.5 border-accent-foreground border-dashed',
          ])}
          onDragEnter={handleDragEnter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          Checksum
        </label>
        <input
          id={id}
          type="file"
          accept="application/pdf"
          ref={inputRef}
          onChange={handleChange}
          hidden
        />
      </div>
    </div>
  )
}
