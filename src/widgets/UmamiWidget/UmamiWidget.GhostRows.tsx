import { cn } from 'tailwind-variants'

import { Skeleton } from '@/components/Skeleton'

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
