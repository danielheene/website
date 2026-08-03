import React, { ComponentProps } from 'react'

import { createSlot } from '@radix-ui/react-slot'
import { cn, tv, VariantProps } from 'tailwind-variants'

import { Separator } from '@/components/Separator'

const buttonGroupStyles = tv({
  base: cn([
    'group/button-group flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10',
    'has-[>[data-slot=button-group]]:gap-2',
    'has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg',
    "[&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  ]),
  variants: {
    orientation: {
      horizontal: cn([
        '[&>*:not(:first-child)]:rounded-l-none',
        '[&>*:not(:first-child)]:border-l-0',
        '[&>*:not(:last-child)]:rounded-r-none',
        '[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg!',
      ]),
      vertical: cn([
        'flex-col [&>*:not(:first-child)]:rounded-t-none',
        '[&>*:not(:first-child)]:border-t-0',
        '[&>*:not(:last-child)]:rounded-b-none',
        '[&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg!',
      ]),
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
})

export const ButtonGroup = ({
  className,
  orientation,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupStyles>) => (
  <div
    data-slot="button-group"
    data-orientation={orientation}
    className={buttonGroupStyles({
      orientation,
      class: className,
    })}
    {...props}
  />
)

const ButtonGroupSlot = createSlot<HTMLDivElement, ComponentProps<'div'>>('button-group')
export const ButtonGroupText = ({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & {
  asChild?: boolean
}) => {
  const Comp = asChild ? ButtonGroupSlot : 'div'

  return (
    <Comp
      className={cn([
        'flex items-center gap-2 border bg-muted px-2.5 text-sm font-medium',
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      ])}
      {...props}
    />
  )
}

export const ButtonGroupSeparator = ({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof Separator>) => (
  <Separator
    data-slot="button-group-separator"
    orientation={orientation}
    className={cn(
      'relative self-stretch bg-input data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto',
      className,
    )}
    {...props}
  />
)
