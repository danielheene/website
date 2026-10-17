import { useMemo } from 'react'

import { cn } from 'tailwind-variants'

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
      className={cn('grid auto-rows-min grid-cols-[auto_min-content] gap-y-3 font-mono', className)}
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
  const barWidth = useMemo(() => (maxValue > 0 ? (value / maxValue) * 100 : 0), [value, maxValue])

  return (
    <div className={cn('col-span-2 grid max-w-full grid-cols-subgrid gap-x-5', className)}>
      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="min-w-1px">{metric}</span>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
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
