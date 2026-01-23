'use client'

import { cn } from '@/utilities/cn'
import { fieldBaseClass, FieldDescription, FieldError, FieldLabel, useField } from '@payloadcms/ui'
import { deburr, kebabCase } from 'lodash-es'
import { JSONFieldClientProps } from 'payload'
import React, { ChangeEvent, KeyboardEvent, useCallback, useRef, useState } from 'react'
import { TagItem } from './TagItem'
import styles from './TagListComponent.module.scss'

type Tag = {
  id: string
  label: string
}

const EVENT_KEY = {
  BACKSPACE: 'Backspace',
  ENTER: 'Enter',
}

const baseClass = 'tag-field'

const TagListComponent: React.FC<JSONFieldClientProps> = ({
  path,
  field: { label, admin: { className, description, style, width } = {} },
  readOnly,
  validate,
}: JSONFieldClientProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [stringValue, setStringValue] = useState<string>('')

  const {
    formInitializing,
    formProcessing,
    setValue,
    showError,
    errorMessage,
    value = [],
  } = useField<Tag[]>({
    path,
    validate,
  })

  const disabled = readOnly || formProcessing || formInitializing

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
        const tag = containerRef.current.querySelector<HTMLButtonElement>(`[data-tag-id="${existingTag.id}"]`)

        tag?.classList.remove('pulsate')
        tag?.classList.add('pulsate')
      } else {
        setValue([...value, tag])
      }

      setStringValue('')
    },
    [value, setValue],
  )

  const handleBackspaceKeyPress = useCallback(
    (stringValue: string): void => {
      const hasFocusedInput = document.activeElement === inputRef.current
      const hasFocusedLabel = document.activeElement.hasAttribute('data-tag-id') && containerRef.current.contains(document.activeElement)
      //
      // if (hasFocusedInput && stringValue.length > 0) {
      //   return setStringValue(stringValue.slice(0, -1))
      // }

      if (hasFocusedInput && stringValue.length === 0) {
        const lastTagElement = containerRef.current.querySelector<HTMLButtonElement>('[data-tag-id]:last-of-type')
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

  const handleDeleteAction = useCallback((deleteId: string) => setValue(value.filter(({ id }) => id !== deleteId)), [setValue, value])

  return (
    <div
      ref={containerRef}
      className={cn([fieldBaseClass, baseClass, className, showError && 'error', disabled && 'read-only'])}
      style={{
        ...style,
        width,
      }}
    >
      <div className={cn([])}>
        <FieldLabel path={path} label={label} />
        <FieldError path={path} message={errorMessage} showError={showError} />
        <div className={styles.TagList} onClick={() => inputRef.current?.focus()}>
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
            className={styles.TagList_Input}
          />
        </div>
      </div>
      <FieldDescription path={path} description={description} />
    </div>
  )
}

export default TagListComponent
