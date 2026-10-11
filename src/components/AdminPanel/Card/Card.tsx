import type React from 'react'

import { cn } from 'tailwind-variants'

import { Button } from '@/components/Button'
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ButtonGroup'
import { Icon } from '@/components/Icon'

export const Card = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-5 rounded-xl border border-border py-5',
        'col-span-full lg:col-span-2 h-full',
        className,
      )}
      {...props}
    />
  )
}

export const CardHeader = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn(
        '@container/card-header h-9 px-5',
        'flex flex-row items-center justify-between gap-2',
        className,
      )}
      {...props}
    />
  )
}

export const CardContent = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn('@container/card-content h-100 px-5', 'flex flex-col justify-start', className)}
      {...props}
    />
  )
}

export const CardPagination = ({
  hasPrevPage,
  hasNextPage,
  setPrevPage,
  setNextPage,
}: {
  hasPrevPage: boolean
  hasNextPage: boolean
  setPrevPage: () => void
  setNextPage: () => void
}) => {
  return hasPrevPage || hasNextPage ? (
    <ButtonGroup orientation="horizontal">
      <Button size="icon-sm" variant="secondary" onClick={setPrevPage} disabled={!hasPrevPage}>
        <Icon name="arrow-left" />
      </Button>
      <ButtonGroupSeparator orientation="vertical" />

      <Button size="icon-sm" variant="secondary" onClick={setNextPage} disabled={!hasNextPage}>
        <Icon name="arrow-right" />
      </Button>
    </ButtonGroup>
  ) : null
}

export const CardTitle = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn(
        'leading-none font-mono font-semibold text-lg whitespace-nowrap text-ellipsis overflow-hidden',
        className,
      )}
      {...props}
    />
  )
}

export const CardDescription = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return <div className={cn('text-muted-foreground text-sm', className)} {...props} />
}

export const CardAction = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
}

export const CardFooter = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return <div className={cn('flex items-center px-5 [.border-t]:pt-5', className)} {...props} />
}
