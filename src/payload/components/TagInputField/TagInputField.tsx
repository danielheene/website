'use client'

import React, { ChangeEvent, KeyboardEvent, useCallback, useRef, useState } from 'react'
import { deburr, kebabCase } from 'lodash-es'
import { BaseValidateOptions, JSONFieldProps } from 'payload'
import {
  fieldBaseClass,
  FieldDescription,
  FieldError,
  FieldLabel,
  useField,
  useFieldProps,
} from '@payloadcms/ui'
import styles from './TagInputField.module.scss'
import { cn } from '@/utilities/cn'
import { TagItem } from './TagItem'

type Tag = {
  id: string
  label: string
}

// type TagFieldExpressions = {
//   allowedChars: RegExp
//   specialChars: RegExp
//   leadingSpecialChars: RegExp
//   trailingSpecialChars: RegExp
// }

const EVENT_KEY = {
  BACKSPACE: 'Backspace',
  ENTER: 'Enter',
}

/**
 * creates a set of expressions for trimming and adjusting tag values
 */
// const generateExpressions = (allowed: string, specials: string): TagFieldExpressions => ({
//   allowedChars: new RegExp(allowed, 'g'),
//   leadingSpecialChars: new RegExp(`^${specials}`, 'g'),
//   specialChars: new RegExp(specials, 'g'),
//   trailingSpecialChars: new RegExp(`${specials}?`, 'g'),
// })

const baseClass = 'tag-field'

export const TagInputField: React.FC<JSONFieldProps> = (props) => {
  const {
    descriptionProps,
    errorProps,
    field,
    field: {
      name,
      _path: pathFromProps,
      admin: {
        className,
        description,
        // editorOptions,
        readOnly: readOnlyFromAdmin,
        style,
        width,
      } = {},
      // jsonSchema,
      label,
      required,
    },
    labelProps,
    readOnly: readOnlyFromTopLevelProps,
    validate: validateFromTopLevelProps,
  } = props
  const readOnlyFromProps = readOnlyFromTopLevelProps || readOnlyFromAdmin

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // const [value, setValue] = useState<Tag[]>([])
  const [stringValue, setStringValue] = useState<string>('')
  // const [jsonError, setJsonError] = useState<string>()
  // const [hasLoadedValue, setHasLoadedValue] = useState(false)

  const memoizedValidate = useCallback(
    (value: string, options: BaseValidateOptions<Tag[], Tag[], string>) => {
      if (typeof validateFromTopLevelProps === 'function') {
        return validateFromTopLevelProps(value, {
          type: 'json',
          name,
          ...options,
          // jsonError,
          required,
        })
      }
    },
    [validateFromTopLevelProps, name, required],
  )

  const { path: pathFromContext, readOnly: readOnlyFromContext } = useFieldProps()

  const {
    formInitializing,
    formProcessing,
    path,
    setValue,
    showError,
    value = [],
  } = useField<Tag[]>({
    path: pathFromContext ?? pathFromProps ?? name,
    validate: memoizedValidate,
  })

  const disabled = readOnlyFromProps || readOnlyFromContext || formProcessing || formInitializing

  const handleChange = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      if (disabled) return
      setStringValue(value.replaceAll(/[^a-zA-Z0-9-.]+/g, ''))
    },
    [disabled, setStringValue],
  )

  const handleEnterKey = useCallback(
    (stringValue: string): void => {
      if (!stringValue.length) return

      const tag: Tag = {
        id: kebabCase(deburr(stringValue)),
        label: stringValue,
      }

      const existingTag = value.find(({ id }) => id === tag.id)
      if (existingTag) {
        const tag = containerRef.current.querySelector<HTMLButtonElement>(
          `[data-tag-id="${existingTag.id}"]`,
        )

        tag?.classList.remove('pulsate')
        tag?.classList.add('pulsate')
        return
      }

      setValue([...value, tag])
      setStringValue('')
    },
    [value, setValue],
  )

  const handleBackspaceKeyPress = useCallback(
    (stringValue: string): void => {
      const hasFocusedInput = document.activeElement === inputRef.current
      const hasFocusedLabel =
        document.activeElement.hasAttribute('data-tag-id') &&
        containerRef.current.contains(document.activeElement)
      //
      // if (hasFocusedInput && stringValue.length > 0) {
      //   return setStringValue(stringValue.slice(0, -1))
      // }

      if (hasFocusedInput && stringValue.length === 0) {
        const lastTagElement = containerRef.current.querySelector<HTMLButtonElement>(
          '[data-tag-id]:last-of-type',
        )
        // const lastTagElement = Array.from(allTagElements).pop()
        return lastTagElement?.focus()
      }

      if (hasFocusedLabel) {
        const deleteId = document.activeElement.getAttribute('data-tag-id')
        containerRef.current.querySelector('input').focus()
        return setValue(value.filter(({ id }) => id !== deleteId))
      }
    },
    [setValue, value],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement | HTMLButtonElement>): void => {
      if (event.key === EVENT_KEY.ENTER) {
        event.preventDefault()
        handleEnterKey(stringValue)
      }
      if (event.key === EVENT_KEY.BACKSPACE) {
        handleBackspaceKeyPress(stringValue)
      }
    },
    [handleBackspaceKeyPress, handleEnterKey, stringValue],
  )

  const handleDeleteAction = useCallback(
    (deleteId: string) => setValue(value.filter(({ id }) => id !== deleteId)),
    [setValue, value],
  )

  return (
    <div
      ref={containerRef}
      className={cn([
        fieldBaseClass,
        baseClass,
        className,
        showError && 'error',
        disabled && 'read-only',
      ])}
      style={{
        ...style,
        width,
      }}
    >
      <FieldLabel
        Label={field?.admin?.components?.Label}
        label={label}
        required={required}
        {...(labelProps || {})}
      />
      <div className={cn([])}>
        <FieldError
          CustomError={field?.admin?.components?.Error}
          path={path}
          {...(errorProps || {})}
        />
        <div className={styles.TagInputField} onClick={() => inputRef.current?.focus()}>
          {value.map(({ id, label }) => (
            <TagItem key={id} id={id} onKeyDown={handleKeyDown} onDeleteAction={handleDeleteAction}>
              {label}
            </TagItem>
          ))}
          <input
            ref={inputRef}
            type="text"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            readOnly={disabled}
            value={stringValue}
            className={styles.TagInputField_Input}
          />
        </div>
      </div>
      <FieldDescription
        Description={field?.admin?.components?.Description}
        description={description}
        {...(descriptionProps || {})}
      />
    </div>
  )
}
