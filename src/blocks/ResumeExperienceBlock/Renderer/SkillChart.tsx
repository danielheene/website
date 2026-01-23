'use client'

import { cn } from '@/utilities/cn'
import { memo, useCallback, useMemo, useState } from 'react'
import { useIntersectionObserver } from '@/utilities/useIntersectionObserver'

type SkillSummary = Record<string, { label: string; time: number }>

interface ResumeExperienceSectionSkillChartProps {
  skillSummary: SkillSummary
  className?: string
}

export const SkillChart = memo(function ResumeExperienceSectionSkillSummary({
  skillSummary,
  className,
}: ResumeExperienceSectionSkillChartProps) {
  const [inView, ref] = useIntersectionObserver<HTMLDivElement>({
    triggerOnce: true,
    root: null,
    threshold: 0.5,
  })

  const [transitionStage, setTransitionStage] = useState<number>(0)

  const largestSkillTime = useMemo(
    () => Object.values(skillSummary).reduce((prev, { time: curr }) => (curr > prev ? curr : prev), 0),
    [skillSummary],
  )

  const calculateSkillWidth = useCallback((time: number) => `${(time / largestSkillTime) * 100}%`, [])

  const nextTransitionWhen = useCallback((whenStage: number) => {
    setTransitionStage((prev) => {
      if (prev === whenStage) return prev + 1
      return prev
    })
  }, [])

  return (
    <div
      ref={ref}
      style={{ maxHeight: inView || transitionStage > 0 ? '100%' : '0' }}
      className={cn('overflow-hidden transition-all ease-in-out duration-100', className)}
      onTransitionEnd={() => nextTransitionWhen(0)}
    >
      <div className="border-l-4 border-white w-full flex flex-col nowrap gap-2 py-4 ">
        {Object.entries(skillSummary).map(([key, { label, time }], index) => {
          const width = calculateSkillWidth(time)

          return (
            <div key={key} className={cn('relative block h-10')}>
              <div
                className={cn('bg-white absolute top-0 bottom-0 left-0', 'transition-all ease-in-out duration-150 delay-100')}
                style={{ width: transitionStage > index ? width : '0' }}
              />
              <div
                className={cn(
                  'absolute top-0 bottom-0 left-0 right-0 px-6',
                  'flex flex-row items-center justify-between',
                  'text-transparent font-mono font-semibold bg-clip-text',
                  'transition-all ease-in-out duration-75 delay-150',
                  transitionStage > index ? 'opacity-100' : 'opacity-0',
                )}
                style={{
                  opacity: transitionStage > index ? 1 : 0,
                  backgroundImage: `linear-gradient(to right, var(--color-primary), var(--color-primary) ${width}, var(--color-white) ${width}, var(--color-white))`,
                }}
                onTransitionEnd={() => nextTransitionWhen(index + 1)}
              >
                <span className="uppercase">{label}</span>
                <span>{(Math.round((time / 12) * 2) / 2).toFixed(1)} years</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
