'use client'

import { CheckboxFieldClientComponent, CheckboxFieldClientProps } from 'payload'
import { fieldBaseClass, useField } from '@payloadcms/ui'

import { Button } from '@repo/ui/Button'
import { Icon } from '@repo/ui/Icon'
import { cn } from 'tailwind-variants'

type FieldComponentProps = {
  tooltip?: string
  iconActive: string
  iconInactive: string
} & CheckboxFieldClientProps

export const FieldComponent: CheckboxFieldClientComponent = ({
  path,
  readOnly,
  iconActive,
  iconInactive,
}: FieldComponentProps) => {
  const { value, setValue, disabled, blocksFilterOptions, errorMessage, errorPaths } =
    useField<boolean>({
      path,
    })

  return (
    <div
      className={cn([
        fieldBaseClass,
        'toggle',
        'flex flex-col justify-end',
      ])}
    >
      <input type="checkbox" readOnly={readOnly} value={String(value)} className="hidden" />
      <Button
        type="button"
        onClick={() => setValue(!value)}
        size="icon"
        variant={value ? 'default' : 'secondary'}
        className="relative cursor-pointer"
      >
        <Icon
          name={iconActive}
          className={cn([
            'absolute size-7 pointer-events-none transition-opacity',
            value ? 'opacity-100' : 'opacity-0',
          ])}
        />
        <Icon
          name={iconInactive}
          className={cn([
            'absolute size-7 pointer-events-none transition-opacity',
            !value ? 'opacity-100' : 'opacity-0',
          ])}
        />
      </Button>
    </div>
  )
}

export default FieldComponent
