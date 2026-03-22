'use client'

import { TextFieldClientProps } from 'payload'
import React, { useState, useCallback } from 'react'
import { useField, TextInput, FieldLabel } from '@payloadcms/ui'
import { RxLockClosed, RxLockOpen2, RxReload } from 'react-icons/rx'

import './TextFieldWithLockAndGenerate.styles.scss'
import { cn } from '@/utilities/cn'

export type TextFieldGenerateFunction = () => (string | Promise<string>)

type TextFieldWithLockAndGenerateProps = ({
  hasLock?: boolean
  hasGenerate?: true
  generateFunction: TextFieldGenerateFunction
} | {
  hasLock?: boolean
  hasGenerate?: false
  generateFunction?: never
}) & TextFieldClientProps

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


  const { value, setValue } = useField<string>({ path })
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
    [setValue, value],
  )

  return (
    <div className="field-type text-field-with-lock-and-generate">
      <div className="label-wrapper">
        <FieldLabel label={label} path={path} htmlFor={inputRef?.current?.id} />
      </div>
      <div className="input-wrapper">
        {hasLock && (<button
            type="button"
            className="input-button input-button--lock"
            onClick={handleUnlockClick}
            onDoubleClick={handleUnlockDoubleClick}
          >
            {isLocked ? <RxLockClosed /> : <RxLockOpen2 />}
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
          path={path || field.name}
          readOnly={Boolean(readOnlyFromProps || isLocked)}
          inputRef={inputRef}
        />
        {hasGenerate && (
          <button
            type="button"
            className="input-button input-button--generate"
            disabled={isLocked}
            onClick={handleGenerateClick}
          >
            <RxReload />
          </button>
        )}
      </div>
    </div>
  )
}
