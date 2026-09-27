'use client'

import type { HTMLAttributes, ReactNode, Ref } from 'react'
import type { SelectFieldClientComponent } from 'payload'
import { FieldDescription, FieldError, FieldLabel, ReactSelect, useField } from '@payloadcms/ui'

import { cn } from 'tailwind-variants'

import { SkillTypeBadge } from './SkillTypeBadge'

type SkillTypeOption = {
  label: string
  value: string
}

type OptionRenderProps = {
  children: ReactNode
  data: SkillTypeOption
  innerProps: HTMLAttributes<HTMLDivElement>
  innerRef: Ref<HTMLDivElement>
  isFocused: boolean
  isSelected: boolean
}

const Option = ({
  children,
  data,
  innerProps,
  innerRef,
  isFocused,
  isSelected,
}: OptionRenderProps) => (
  <div
    ref={innerRef}
    {...innerProps}
    className={cn([
      'rs__option',
      isFocused && 'rs__option--is-focused',
      isSelected && 'rs__option--is-selected',
    ])}
  >
    <SkillTypeBadge label={String(children)} value={data.value} />
  </div>
)

type SingleValueRenderProps = {
  children: ReactNode
  data: SkillTypeOption
  innerProps: HTMLAttributes<HTMLDivElement>
}

const SingleValue = ({ children, data, innerProps }: SingleValueRenderProps) => (
  <div {...innerProps} className="rs__single-value">
    <SkillTypeBadge label={String(children)} value={data.value} />
  </div>
)

/**
 * Reimplements Payload's default select field render (rather than
 * overriding just the Cell) so the open dropdown's options — not only the
 * closed value — can render as colored badges. react-select isn't a direct
 * dependency here, so Option/SingleValue are self-contained instead of
 * wrapping react-select's own default components.
 */
export const FieldComponent: SelectFieldClientComponent = ({ field, path, readOnly }) => {
  const { setValue, showError, value } = useField<string>({
    path,
  })

  const options: SkillTypeOption[] = (field.options ?? []).map((option) =>
    typeof option === 'string'
      ? {
          label: option,
          value: option,
        }
      : {
          label: String(option.label),
          value: option.value,
        },
  )
  const selected = options.find((option) => option.value === value) ?? null

  return (
    <div className="field-type select">
      <FieldLabel label={field.label} path={path} required={field.required} />
      <div className="field-type__wrap">
        <FieldError path={path} showError={showError} />
        <ReactSelect
          components={{
            Option,
            SingleValue,
          }}
          disabled={readOnly}
          isClearable
          onChange={(option) => setValue(option ? (option as SkillTypeOption).value : null)}
          options={options}
          value={selected}
        />
      </div>
      <FieldDescription description={field.admin?.description} path={path} />
    </div>
  )
}

export default FieldComponent
