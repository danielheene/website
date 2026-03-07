import { useMemo, JSX, ReactNode, ComponentType, ReactElement } from 'react'
import { cn } from '@/utilities/cn'

interface MetricsTableData {
  metricName: string
  valueName: string
  data: { x: string; y: number }[]
}
export const MetricsTable = ({ metricName, valueName, data }: MetricsTableData) => {
  const maxValue = useMemo(() => {
    if (!data) return 0
    return Math.max(...data.map((d) => d.y), 0)
  }, [data])

  return (
    <div className="grid grid-cols-[auto_min-content] font-mono">
      <MetricsTableRow renderMetric={() => metricName} renderValue={() => valueName} />
      {data.map(({ x: metric, y: value }, index) => (
        <MetricsTableRow
          key={metric}
          renderMetric={() => (
            <>
              <span className="min-w-1px">{metric}</span>
              <div className="h-1.5 mt-1 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(value / maxValue) * 100}%` }} />
              </div>
            </>
          )}
          renderValue={() => value.toLocaleString()}
        />
      ))}
    </div>
  )
}

const MetricsTableRow = ({
  renderMetric,
  renderValue,
  className,
}: {
  renderMetric: () => ReactNode
  renderValue: () => ReactNode
  className?: string
}) => {
  return (
    <div className={cn('grid col-span-2 grid-cols-subgrid max-w-full', className)}>
      <div className="whitespace-nowrap overflow-ellipsis overflow-hidden p-2">{renderMetric()}</div>
      <div className="min-w-12 text-right tabular-nums p-2">{renderValue()}</div>
    </div>
  )
}
