'use client'

import isNumber from 'lodash-es/isNumber'
import prettyMs from 'pretty-ms'
import timestring from 'timestring'

import { getTranslation } from '@payloadcms/translations'
import {
  fieldBaseClass,
  RenderCustomComponent,
  toast,
  useField,
  useTranslation,
} from '@payloadcms/ui'
import { FieldDescription } from '@payloadcms/ui/fields/FieldDescription'
import { FieldError } from '@payloadcms/ui/fields/FieldError'
import { FieldLabel } from '@payloadcms/ui/fields/FieldLabel'
import { useThrottledValue } from '@payloadcms/ui/hooks/useThrottledValue'
import { mergeFieldStyles } from '@payloadcms/ui/shared'
import { NumberFieldClientComponent, NumberFieldClientProps } from 'payload'
import { useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/cn'
import { extractErrorMessage } from '@/lib/extractErrorMessage'

export const FieldComponent: NumberFieldClientComponent = ({
  field,
  path,
}: NumberFieldClientProps) => {
  const { label, admin } = field
  const { description, placeholder: placeholderFromProps, readOnly, className } = admin

  const inputRef = useRef<HTMLInputElement>(null)
  const [localValue, setLocalValue] = useState<string>('')
  const throttledLocalValue = useThrottledValue(localValue, 1000)

  const { i18n, t } = useTranslation()
  const {
    value: fieldValue,
    formProcessing,
    formInitializing,
    setValue: setFieldValue,
    showError,
    errorMessage,
    customComponents: {
      Description: DescriptionComponent,
      Labe: LabelComponent,
      Error: ErrorComponent,
    },
  } = useField<number>({
    path,
  })

  useEffect(() => {
    if (localValue || !isNumber(fieldValue)) return

    setLocalValue(prettyMs(fieldValue))
  }, [
    fieldValue,
    localValue,
  ])

  useEffect(() => {
    if (!throttledLocalValue) return

    try {
      setFieldValue(timestring(throttledLocalValue, 'ms'))
    } catch (error) {
      const message = extractErrorMessage(error)
      toast.error(`Invalid duration format: ${message}`)
    }
  }, [
    setFieldValue,
    throttledLocalValue,
  ])

  const styles = useMemo(
    () => mergeFieldStyles(field),
    [
      field,
    ],
  )
  const placeholder = getTranslation(placeholderFromProps, i18n)

  return (
    <div
      className={cn(
        fieldBaseClass,
        'text',
        'duration',
        className,
        showError && 'error',
        readOnly && 'read-only',
      )}
      style={styles}
    >
      <header className={`${fieldBaseClass}__header`}>
        <RenderCustomComponent
          CustomComponent={LabelComponent}
          Fallback={<FieldLabel label={label} path={path} />}
        />
        <RenderCustomComponent
          CustomComponent={DescriptionComponent}
          Fallback={<FieldDescription description={description} path={path} />}
        />
      </header>
      <div className={`${fieldBaseClass}__wrap`}>
        <RenderCustomComponent
          CustomComponent={ErrorComponent}
          Fallback={<FieldError path={path} showError={showError} message={errorMessage} />}
        />
        <input
          className="form-input"
          disabled={readOnly || formProcessing || formInitializing}
          id={`field-${path?.replace(/\./g, '__')}`}
          name={path}
          onChange={(event) => setLocalValue(event.target.value)}
          placeholder={placeholder}
          ref={inputRef}
          type="text"
          value={localValue}
        />
      </div>
    </div>
  )
}

export default FieldComponent
