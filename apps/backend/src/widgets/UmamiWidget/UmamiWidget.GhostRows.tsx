import { Skeleton } from '@website/components/Skeleton'
import { cn } from 'tailwind-variants'

interface GhostRowsProps {
  rows: number
  className?: string
}

/** Pulsing placeholder rows matching `MetricsTable`'s row height. */
export const GhostRows = ({ rows, className }: GhostRowsProps) => {
  return (
    <div className={cn(['flex flex-col gap-y-3', className])}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-7 w-full" />
      ))}
    </div>
  )
}
