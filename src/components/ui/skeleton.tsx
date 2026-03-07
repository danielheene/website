import { cn } from '@/utilities/cn'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'bg-accent relative rounded-sm overflow-hidden',
        'before:absolute before:inset-0 before:animate-shimmer before:bg-linear-to-r before:from-transparent before:via-accent-foreground/30 before:to-transparent',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
