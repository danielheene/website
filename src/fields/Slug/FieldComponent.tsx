'use client'

import { generateSlug } from '@/utilities/generateSlug'
import { TextInput, useField, useForm } from '@payloadcms/ui'
import { TextFieldClientProps } from 'payload'
import React, { useCallback, useRef, useState } from 'react'
import { RxLockClosed, RxLockOpen2, RxReload } from 'react-icons/rx'

import './FieldComponent.styles.scss'

type SlugComponentProps = {
  fieldToUse: string
} & TextFieldClientProps

const FieldComponent: React.FC<SlugComponentProps> = ({ field, fieldToUse, path, readOnly: readOnlyFromProps }) => {
  const {
    admin: { placeholder },
  } = field

  const tooltipRef = useRef<HTMLButtonElement>(null)
  const { value, setValue } = useField<string>({ path: path || field.name })
  const [isLocked, setIsLocked] = useState<boolean>(true)

  const { getDataByPath } = useForm()

  const handleUnlock = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    setIsLocked((lockedState) => !lockedState)
  }, [])

  const handleGenerate = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()

      const fieldToUseValue = getDataByPath(fieldToUse) as string

      if (fieldToUseValue) {
        const formattedSlug = generateSlug(fieldToUseValue)
        if (formattedSlug && formattedSlug !== value) setValue(formattedSlug)
      }
    },
    [setValue, value, fieldToUse, getDataByPath],
  )

  return (
    <div className="field-type slug-field-component">
      <div className="input-wrapper">
        <button
          ref={tooltipRef}
          className="input-button input-button--lock"
          onClick={(e) => e.preventDefault()}
          onDoubleClick={handleUnlock}
        >
          {isLocked ? <RxLockClosed /> : <RxLockOpen2 />}
        </button>
        <TextInput
          className="input-field"
          value={value}
          onChange={setValue}
          placeholder={placeholder}
          path={path || field.name}
          readOnly={Boolean(readOnlyFromProps || isLocked)}
        />

        <button className="input-button input-button--reload" disabled={isLocked} onClick={handleGenerate}>
          <RxReload />
        </button>
      </div>
    </div>
  )
}

export default FieldComponent
