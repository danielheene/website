import { useMemo } from 'react'

import { cn } from '@/lib/cn'

interface MetricsTableData {
  className?: string
  data: {
    x: string
    y: number
  }[]
  maxValue?: number
}

export const MetricsTable = ({ className, data, maxValue }: MetricsTableData) => {
  return (
    <div
      className={cn('grid grid-cols-[auto_min-content] auto-rows-min font-mono gap-y-3', className)}
    >
      {data.map(({ x: metric, y: value }, index) => (
        <MetricsTableRow key={index} metric={metric} value={value} maxValue={maxValue} />
      ))}
    </div>
  )
}

const MetricsTableRow = ({
  metric,
  value,
  maxValue = 0,
  className,
}: {
  metric: string
  value: number
  maxValue?: number
  className?: string
}) => {
  const barWidth = useMemo(
    () => (maxValue > 0 ? (value / maxValue) * 100 : 0),
    [
      value,
      maxValue,
    ],
  )

  return (
    <div className={cn('grid col-span-2 grid-cols-subgrid max-w-full gap-x-5', className)}>
      <div className="whitespace-nowrap overflow-ellipsis overflow-hidden">
        <span className="min-w-1px">{metric}</span>
        <div className="h-1.5 mt-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${barWidth}%`,
            }}
          />
        </div>
      </div>
      <div className="text-right tabular-nums">{value.toLocaleString()}</div>
    </div>
  )
}
