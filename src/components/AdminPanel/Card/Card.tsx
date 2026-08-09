import type React from 'react'

import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { cn } from '@/lib/cn'

export const Card = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border py-6',
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
        '@container/card-header min-h-10 gap-2 px-6',
        'flex flex-row items-center justify-between',
        className,
      )}
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
    <div className="inline-flex">
      <Button
        size="icon"
        type="button"
        variant="secondary"
        // outline
        className="text-3xl pr-0.5"
        onClick={setPrevPage}
        disabled={!hasPrevPage}
      >
        <Icon name="arrow-left" />
      </Button>
      <Button
        size="icon"
        type="button"
        variant="secondary"
        // outline
        className="text-3xl pl-0.5"
        onClick={setNextPage}
        disabled={!hasNextPage}
      >
        <Icon name="arrow-right" />
      </Button>
    </div>
  ) : null
}

export const CardTitle = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return <div className={cn('leading-none font-semibold', className)} {...props} />
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

export const CardContent = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return <div className={cn('px-6 flex flex-col justify-start', className)} {...props} />
}

export const CardFooter = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return <div className={cn('flex items-center px-6 [.border-t]:pt-6', className)} {...props} />
}
