'use client'

import * as SwitchPrimitives from '@radix-ui/react-switch'

import { HTMLAttributes, JSX, Ref, RefAttributes, useState } from 'react'

import { ClassValue, cn } from '@/lib/cn'

interface SwitchProps extends Omit<HTMLAttributes<HTMLElement>, 'className'> {
  className?: ClassValue
  ref?: Ref<HTMLElement>
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Switch = ({
  className,
  ref,
  checked: checkedFromProps,
  onCheckedChange: onCheckedChangeFromProps,
  ...props
}: SwitchProps): JSX.Element => {
  const [localChecked, setLocalChecked] = useState(false)

  const checked = typeof checkedFromProps !== 'undefined' ? checkedFromProps : localChecked
  const setChecked =
    typeof onCheckedChangeFromProps === 'function' ? onCheckedChangeFromProps : setLocalChecked

  return (
    <SwitchPrimitives.Root
      ref={ref as Ref<HTMLButtonElement>}
      className={cn([
        'peer inline-flex p-0 h-6 w-11 shrink-0',
        'cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50 ',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        className,
      ])}
      checked={checked}
      onCheckedChange={setChecked}
      {...props}
      data-state={checked ? 'checked' : 'unchecked'}
      asChild
    >
      <span tabIndex={0} role="switch" aria-checked={checked}>
        <SwitchPrimitives.Thumb
          className={cn([
            'block h-5 w-5 rounded-full bg-white',
            'pointer-events-none shadow-lg ring-0',
            'transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
          ])}
          data-state={checked ? 'checked' : 'unchecked'}
          asChild
        >
          <span />
        </SwitchPrimitives.Thumb>
      </span>
    </SwitchPrimitives.Root>
  )
}
