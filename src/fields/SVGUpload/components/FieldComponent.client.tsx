'use client'

import { ChangeEvent, DragEvent, Fragment, JSX, useCallback, useId, useMemo, useState } from 'react'
import { UIFieldClientProps } from 'payload'
import { toast, useField } from '@payloadcms/ui'

import { optimize } from 'svgo/browser'

import { cn } from '@/lib/cn'
import { extractErrorMessage } from '@/lib/extractErrorMessage'

interface FieldComponentClientProps extends UIFieldClientProps {
  initialValue?: string
}

export const FieldComponentClient = ({
  initialValue,
  path,
  field,
}: FieldComponentClientProps): JSX.Element => {
  const id = useId()

  const { value, setValue } = useField<string>({
    path,
  })

  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState<boolean>(false)

  /**
   * Handles the start of the drag event.
   */
  const handleStart = useCallback(
    (event: DragEvent<HTMLLabelElement> | ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragging(true)
    },
    [],
  )

  /**
   * Handles the end of the drag event.
   */
  const handleEnd = useCallback(
    (event: DragEvent<HTMLLabelElement> | ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragging(false)
    },
    [],
  )

  /**
   * Handles the file upload process with sanitization and error handling.
   */
  const handleFileChange = useCallback(
    async (file: File) => {
      setIsUploading(true)

      const reader = new FileReader()

      reader.addEventListener('load', async (event: ProgressEvent<FileReader>) => {
        if (!event.target?.result) {
          toast.error('Uploaded file seems to be empty. Please try again.')
          return
        }

        try {
          const svg = event.target.result.toString()
          const { data } = optimize(svg, {
            js2svg: {
              indent: 2,
              pretty: true,
            },
            multipass: true,
            plugins: [
              {
                name: 'preset-default', // includes: removeXMLProcInst removeComments removeEmptyAttrs removeEmptyContainers
                params: {
                  floatPrecision: 3,
                  transformPrecision: 3,
                },
              },
              'mergePaths',
              'convertTransform',
              {
                name: 'convertColors',
                params: {
                  currentColor: true,
                },
              },
              {
                name: 'removeUnknownsAndDefaults',
                params: {
                  unknownContent: true,
                  unknownAttrs: true,
                  defaultAttrs: true,
                  defaultMarkupDeclarations: true,
                  uselessOverrides: true,
                  keepDataAttrs: false,
                  keepAriaAttrs: false,
                  keepRoleAttr: false,
                },
              },
              'removeRasterImages',
              'removeScripts',
              'removeStyleElement',
              'removeDimensions',
              {
                name: 'removeAttrs',
                params: {
                  attrs: [
                    'class',
                    'style',
                    'fill',
                    'id',
                    'width',
                    'height',
                  ],
                  elemSeparator: ':',
                  preserveCurrentColor: true,
                },
              },
            ],
          })

          setValue(data)
          toast.success('Logo uploaded successfully!')
        } catch (error: unknown) {
          toast.error(`Requesting logo sanitization failed: ${extractErrorMessage(error)}`)
        } finally {
          setIsUploading(false)
        }
      })

      /**
       * Handles the error event when reading the file.
       */
      reader.addEventListener('error', (event: ProgressEvent<FileReader>): void => {
        toast.error(`Processing uploaded file has failed: ${extractErrorMessage(event)}`)
        setIsUploading(false)
      })

      reader.readAsText(file, 'UTF-8')
    },
    [
      setValue,
    ],
  )

  /**
   * Handles the file change event.
   */
  const handleDrop = useCallback(
    async (event: DragEvent<HTMLLabelElement> | ChangeEvent<HTMLInputElement>) => {
      handleEnd(event)

      const file =
        'dataTransfer' in event
          ? event.dataTransfer.files[0]
          : 'target' in event
            ? event.target.files[0]
            : null

      if (!file?.type?.includes('svg')) {
        toast.error('The uploaded file must be an SVG.')
      } else {
        await handleFileChange(file)
      }
    },
    [
      handleEnd,
      handleFileChange,
    ],
  )

  const logoContent = useMemo(() => {
    return value || initialValue
      ? optimize(value || initialValue, {
          js2svg: {
            indent: 2,
            pretty: true,
          },
        }).data
      : null
  }, [
    value,
    initialValue,
  ])

  const baseIconStyles = [
    'absolute left-0 top-0 right-0 bottom-0',
    'flex flex-col justify-center items-center',
    '[&>svg]:w-[90%] [&>svg]:max-w-[90%] [&>svg]:h-[90%] [&>svg]:max-h-[90%]',
    '[&_path]:fill-current',
  ]

  return (
    <div
      className={cn([
        'flex flex-col justify-center items-center',
        'overflow-hidden aspect-3-2 relative w-full',
        'bg-card border border-border',
      ])}
    >
      <label
        htmlFor={id}
        className={cn([
          'cursor-pointer',
        ])}
        onDragEnter={handleStart}
        onDragOver={handleStart}
        onDragLeave={handleEnd}
        onDrop={handleDrop}
      >
        {!logoContent && !isUploading && (
          <Fragment>
            <div
              className={cn([
                baseIconStyles,
                '[&>svg]:opacity-10',
              ])}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M23 18H1l7.25-9.67l2 2.67L14 6zm-11.5-5.33L14 16h5l-5-6.67zM5 16h6.5l-3.25-4.33z"
                />
              </svg>
            </div>
            <span
              className={cn([
                'flex flex-row flex-nowrap',
                'font-mono uppercase items-center',
              ])}
            >
              Click or drag the logo here.
            </span>
          </Fragment>
        )}
        {isUploading && (
          <span
            className={cn([
              baseIconStyles,
              '[&>svg]:opacity-10 [&>svg]:animate-spin [&>svg]:origin-center',
              '[&>svg]:w-[50%] [&>svg]:max-w-[50%] [&>svg]:h-[50%] [&>svg]:max-h-[50%]',
            ])}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5a.75.75 0 0 1 1.5 0c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2a.75.75 0 0 1 0 1.5"
              />
            </svg>
          </span>
        )}
        {logoContent && !isUploading && (
          <div
            className={cn([
              baseIconStyles,
            ])}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
            dangerouslySetInnerHTML={{
              __html: logoContent,
            }}
          />
        )}
      </label>
      <input id={id} type="file" accept="image/svg+xml" onChange={handleDrop} hidden />
    </div>
  )
}
