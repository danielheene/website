'use client'

import {
  ChangeEvent,
  DragEvent,
  Fragment,
  JSX,
  MouseEvent,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react'
import { TextFieldClientProps } from 'payload'

import { toast } from 'react-toastify'
import styles from './CustomerLogoField.module.css'
import { ClassValue, cn } from '@/utilities/cn'
import { Image, XIcon } from 'lucide-react'
import { useField } from '@payloadcms/ui'

interface CustomerLogoFieldProps extends TextFieldClientProps {
  className?: ClassValue
}

export const CustomerLogoField = ({
  className,
  path,
  // field,
  // readOnly,
  // inputRef,
  validate,
}: CustomerLogoFieldProps): JSX.Element => {
  const id = useId()
  const { value, setValue } = useField<string>({ path, validate })
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const handleStart = useCallback(
    (event: DragEvent<HTMLLabelElement> | ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragging(true)
    },
    [],
  )

  const handleEnd = useCallback(
    (event: DragEvent<HTMLLabelElement> | ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragging(false)
    },
    [],
  )

  const handleFileUpload = useCallback(async (file: File) => {
    const sanitizeUrl = new URL('/api/image/sanitize-svg', process.env.NEXT_PUBLIC_SERVER_URL)
    const reader = new FileReader()

    reader.readAsText(file, 'UTF-8')
    reader.onload = async (event: ProgressEvent<FileReader>) => {
      toast.info('')
      const { logo } = await fetch(sanitizeUrl, {
        method: 'POST',
        body: JSON.stringify({ logo: event.target?.result }),
      })
        .then((response) => response.json())
        .catch((error) => console.log(error))

      setValue(Buffer.from(logo).toString('base64'))
    }
  }, [])

  const handleFileChange = useCallback(
    async (event: DragEvent<HTMLLabelElement> | ChangeEvent<HTMLInputElement>) => {
      handleEnd(event)

      const file =
        'dataTransfer' in event
          ? event.dataTransfer.files[0]
          : 'target' in event
            ? event.target.files[0]
            : null

      if (!file || !file.type.includes('svg')) {
        toast.error('The uploaded file must be an SVG.', {
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        })
      } else {
        await handleFileUpload(file)
      }
    },
    [],
  )

  const handleFileDelete = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
    setValue(null)
  }, [])

  const logoContent = useMemo(() => {
    return value ? Buffer.from(value, 'base64').toString('utf-8') : null
  }, [value])

  return (
    <div className={cn([styles.CustomerLogoFieldContainer, className])}>
      {!logoContent ? (
        <Fragment>
          <label
            htmlFor={id}
            className={cn([styles.DropArea, isDragging && styles.DropAreaActive])}
            onDragEnter={handleStart}
            onDragOver={handleStart}
            onDragLeave={handleEnd}
            onDrop={handleFileChange}
          >
            <span className={cn([styles.DropAreaLabel, styles.DropAreaIcon])}>
              <Image height="75%" />
            </span>
            <span className={cn([styles.DropAreaLabel, styles.DropAreaText])}>
              Click or drag the logo here.
            </span>
          </label>
          <input id={id} type="file" accept="image/svg+xml" onChange={handleFileChange} hidden />
        </Fragment>
      ) : (
        <Fragment>
          <div
            className={styles.CustomerLogoFieldImage}
            dangerouslySetInnerHTML={{ __html: logoContent }}
          />
          <button
            role="button"
            className={styles.CustomerLogoFieldDelete}
            onClick={handleFileDelete}
          >
            <XIcon width="1em" height="1em" />
          </button>
        </Fragment>
      )}
    </div>
  )
}
