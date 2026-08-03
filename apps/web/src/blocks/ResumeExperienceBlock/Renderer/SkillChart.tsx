'use client'

import { memo, useCallback, useMemo, useState } from 'react'

import { useIntersectionObserver } from 'usehooks-ts'

import { cn } from '@repo/utils/cn'
import { ResumeSkillTagData } from '@/types/payload'

interface ResumeExperienceSectionSkillChartProps {
  skillTags: Pick<ResumeSkillTagData, 'id' | 'title' | 'slug' | 'interval'>[]
  className?: string
  maxSkillsToShow?: number
}

export const SkillChart = memo(function SkillChart({
  skillTags,
  className,
  maxSkillsToShow = 5,
}: ResumeExperienceSectionSkillChartProps) {
  const [ref, inView] = useIntersectionObserver({
    freezeOnceVisible: true,
    threshold: 0.5,
  })

  const [transitionStage, setTransitionStage] = useState<number>(0)

  const renderedSkills = useMemo(
    () =>
      skillTags
        .sort(({ interval: aTime }, { interval: bTime }) => bTime - aTime)
        .slice(0, maxSkillsToShow),
    [
      skillTags,
      maxSkillsToShow,
    ],
  )

  const largestSkillTime = useMemo(
    () => renderedSkills.reduce((prev, { interval: curr }) => (curr > prev ? curr : prev), 0),
    [
      renderedSkills,
    ],
  )

  const calculateSkillWidth = useCallback(
    (time: number) => `${Math.round((time / largestSkillTime) * 100)}%`,
    [
      largestSkillTime,
    ],
  )

  const nextTransitionWhen = useCallback((whenStage: number) => {
    setTransitionStage((prev) => {
      if (prev === whenStage) return prev + 1
      return prev
    })
  }, [])

  return (
    <div
      ref={ref}
      style={{
        maxHeight: inView || transitionStage > 0 ? '100%' : '0',
      }}
      className={cn('overflow-hidden transition-all ease-in-out duration-100', className)}
      onTransitionEnd={() => nextTransitionWhen(0)}
    >
      <div className="border-l-4 border-white w-full flex flex-col nowrap gap-2 py-4 ">
        {renderedSkills.map(({ id, title, interval, slug }, index) => {
          const width = calculateSkillWidth(interval)

          return (
            <div key={slug} className={cn('relative block h-10')}>
              <div
                className={cn(
                  'bg-white absolute top-0 bottom-0 left-0',
                  'transition-all ease-in-out duration-150 delay-100',
                )}
                style={{
                  width: transitionStage > index ? width : '0',
                }}
              />
              <div
                className={cn(
                  'absolute top-0 bottom-0 left-0 right-0 px-6',
                  'flex flex-row items-center justify-between',
                  'text-transparent font-mono font-medium bg-clip-text',
                  'transition-all ease-in-out duration-150 delay-300',
                  transitionStage > index ? 'opacity-100' : 'opacity-0',
                )}
                style={{
                  opacity: transitionStage > index ? 1 : 0,
                  backgroundImage: `linear-gradient(to right, var(--color-primary), var(--color-primary) ${width}, var(--color-white) ${width}, var(--color-white))`,
                }}
                onTransitionEnd={() => nextTransitionWhen(index + 1)}
              >
                <span className="uppercase">{title}</span>
                <span>{(Math.round((interval / 12) * 10) / 10).toFixed(1)} years</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
