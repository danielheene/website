import { cn } from 'tailwind-variants'

import { Skeleton } from '@/components/Skeleton'

// Deterministic, varied bar heights — avoids both a flat row (looks broken)
// and Math.random() (would reshuffle on every re-render).
const BAR_HEIGHTS = [45, 70, 55, 90, 60, 80, 50, 75, 65, 95, 40, 85]

interface GhostBarChartProps {
  className?: string
}

/** Pulsing placeholder shaped like a bar chart, for `PageViewsSection`. */
export const GhostBarChart = ({ className }: GhostBarChartProps) => {
  return (
    <div className={cn(['flex items-end gap-2', className])}>
      {BAR_HEIGHTS.map((height, i) => (
        <Skeleton key={i} className="flex-1" style={{ height: `${height}%` }} />
      ))}
    </div>
  )
}
