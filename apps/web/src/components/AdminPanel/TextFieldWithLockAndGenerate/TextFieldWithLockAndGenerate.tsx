'use client'

import type React from 'react'
import { useCallback, useState } from 'react'
import type { TextFieldClientProps } from 'payload'

import './TextFieldWithLockAndGenerate.styles.css'

import { useField } from '@payloadcms/ui'
import { FieldLabel } from '@payloadcms/ui/fields/FieldLabel'
import { TextInput } from '@payloadcms/ui/fields/Text'

import { Icon } from '@/components/Icon'
import { cn } from '@repo/utils/cn'

export type TextFieldGenerateFunction = () => string | Promise<string>

export type TextFieldWithLockAndGenerateProps = (
  | {
      hasLock?: boolean
      hasGenerate?: true
      generateFunction: TextFieldGenerateFunction
    }
  | {
      hasLock?: boolean
      hasGenerate?: false
      generateFunction?: never
    }
) &
  TextFieldClientProps

export const TextFieldWithLockAndGenerate: React.FC<TextFieldWithLockAndGenerateProps> = ({
  field,
  hasGenerate,
  hasLock,
  path,
  readOnly: readOnlyFromProps,
  generateFunction,
  inputRef,
}) => {
  const {
    label,
    name,
    admin: { placeholder },
  } = field

  const { value, setValue } = useField<string>({
    path,
  })
  const [isLocked, setIsLocked] = useState<boolean>(hasLock && readOnlyFromProps !== true)

  const handleUnlockClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }, [])

  const handleUnlockDoubleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsLocked((lockedState) => !lockedState)
  }, [])

  const handleGenerateClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()

      Promise.resolve(generateFunction()).then((nextValue) => {
        if (nextValue && nextValue !== value) setValue(nextValue)
      })
    },
    [
      setValue,
      value,
      generateFunction,
    ],
  )

  return (
    <div className="field-type text-field-with-lock-and-generate">
      <div className="label-wrapper">
        <FieldLabel label={label} path={path} htmlFor={inputRef?.current?.id} />
      </div>
      <div className="input-wrapper">
        {hasLock && !readOnlyFromProps && (
          <button
            type="button"
            className="input-button input-button--lock"
            onClick={handleUnlockClick}
            onDoubleClick={handleUnlockDoubleClick}
          >
            {isLocked ? (
              <Icon name="radix-icons:lock-closed" />
            ) : (
              <Icon name="radix-icons:lock-open-2" />
            )}
          </button>
        )}
        <TextInput
          className={cn(
            'input-field',
            hasLock && 'input-field--has-lock',
            hasGenerate && 'input-field--has-generate',
          )}
          value={value}
          onChange={setValue}
          placeholder={placeholder}
          path={path || name}
          readOnly={Boolean(readOnlyFromProps || isLocked)}
          inputRef={inputRef}
        />
        {hasGenerate && !readOnlyFromProps && (
          <button
            type="button"
            className="input-button input-button--generate"
            disabled={isLocked}
            onClick={handleGenerateClick}
          >
            <Icon name="radix-icons:reload" />
          </button>
        )}
      </div>
    </div>
  )
}
