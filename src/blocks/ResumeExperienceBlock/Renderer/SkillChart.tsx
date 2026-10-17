'use client'

import { memo, useCallback, useMemo, useState } from 'react'

import { cn } from 'tailwind-variants'
import { useIntersectionObserver } from 'usehooks-ts'

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
    [skillTags, maxSkillsToShow],
  )

  const largestSkillTime = useMemo(
    () => renderedSkills.reduce((prev, { interval: curr }) => (curr > prev ? curr : prev), 0),
    [renderedSkills],
  )

  const calculateSkillWidth = useCallback(
    (time: number) => `${Math.round((time / largestSkillTime) * 100)}%`,
    [largestSkillTime],
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
      className={cn('overflow-hidden transition-all duration-100 ease-in-out', className)}
      onTransitionEnd={() => nextTransitionWhen(0)}
    >
      <div className="nowrap flex w-full flex-col gap-2 border-l-4 border-white py-4">
        {renderedSkills.map(({ title, interval, slug }, index) => {
          const width = calculateSkillWidth(interval)

          return (
            <div key={slug} className={cn('relative block h-10')}>
              <div
                className={cn(
                  'absolute inset-y-0 left-0 bg-white',
                  'transition-all delay-100 duration-150 ease-in-out',
                )}
                style={{
                  width: transitionStage > index ? width : '0',
                }}
              />
              <div
                className={cn(
                  'absolute inset-0 px-6',
                  'flex flex-row items-center justify-between',
                  'bg-clip-text font-mono font-medium text-transparent',
                  'transition-all delay-300 duration-150 ease-in-out',
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
