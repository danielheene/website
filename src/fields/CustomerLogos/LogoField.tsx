'use client'

import { ChangeEvent, DragEvent, Fragment, JSX, useCallback, useId, useMemo, useState } from 'react'
import { UIFieldClientProps } from 'payload'
import { toast, useField } from '@payloadcms/ui'
import { optimize } from 'svgo/browser'

import { ClassValue, cn } from '@/utilities/cn'
import { extractErrorMessage } from '@/utilities/extractErrorMessage'

import styles from './LogoField.module.css'

interface LogoFieldProps extends UIFieldClientProps {
  className?: ClassValue
}

const LogoField = ({ path }: LogoFieldProps): JSX.Element => {
  const id = useId()

  const logoPath = `${path.slice(0, path?.lastIndexOf('.'))}.logo`
  const { value, setValue } = useField<string>({ path: logoPath })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState<boolean>(false)

  /**
   * Handles the start of the drag event.
   */
  const handleStart = useCallback((event: DragEvent<HTMLLabelElement> | ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }, [])

  /**
   * Handles the end of the drag event.
   */
  const handleEnd = useCallback((event: DragEvent<HTMLLabelElement> | ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }, [])

  /**
   * Handles the file upload process with sanitization and error handling.
   */
  const handleFileUpload = useCallback(async (file: File) => {
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
          multipass: true,
          plugins: [
            {
              name: 'preset-default', // includes: removeXMLProcInst removeComments removeEmptyAttrs removeEmptyContainers
              params: {
                floatPrecision: 3,
                transformPrecision: 3,
              },
            },
            'removeRasterImages',
            'removeScripts',
            'removeStyleElement',
            {
              name: 'removeAttrs',
              params: {
                attrs: ['class', 'style', 'fill', 'id', 'width', 'height'],
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
  }, [])

  /**
   * Handles the file change event.
   */
  const handleFileChange = useCallback(async (event: DragEvent<HTMLLabelElement> | ChangeEvent<HTMLInputElement>) => {
    handleEnd(event)

    const file = 'dataTransfer' in event ? event.dataTransfer.files[0] : 'target' in event ? event.target.files[0] : null

    if (!file || !file.type.includes('svg')) {
      toast.error('The uploaded file must be an SVG.')
    } else {
      await handleFileUpload(file)
    }
  }, [])

  const logoContent = useMemo(() => {
    return value ? optimize(value, { js2svg: { indent: 2, pretty: true } }).data : null
  }, [value])

  return (
    <div className={cn([styles.LogoFieldContainer])}>
      <label
        htmlFor={id}
        className={cn([styles.DropArea, isDragging && styles.DropAreaActive])}
        onDragEnter={handleStart}
        onDragOver={handleStart}
        onDragLeave={handleEnd}
        onDrop={handleFileChange}
      >
        {!logoContent && !isUploading && (
          <Fragment>
            <div className={cn([styles.DropAreaIcon])}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="currentColor" d="M23 18H1l7.25-9.67l2 2.67L14 6zm-11.5-5.33L14 16h5l-5-6.67zM5 16h6.5l-3.25-4.33z" />
              </svg>
            </div>
            <span className={cn([styles.DropAreaLabel])}>Click or drag the logo here.</span>
          </Fragment>
        )}
        {isUploading && (
          <span className={cn([styles.DropAreaIcon, styles.DropAreaSpinner])}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5a.75.75 0 0 1 1.5 0c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2a.75.75 0 0 1 0 1.5"
              />
            </svg>
          </span>
        )}
        {logoContent && !isUploading && (
          <Fragment>
            <div className={styles.LogoFieldImage} dangerouslySetInnerHTML={{ __html: logoContent }} />
          </Fragment>
        )}
      </label>
      <input id={id} type="file" accept="image/svg+xml" onChange={handleFileChange} hidden />
    </div>
  )
}

export default LogoField
