'use client'

import { useLocale, useRouteTransition } from '@payloadcms/ui'
import { useLocaleLoading } from '@payloadcms/ui/providers/Locale'
import { useRouter } from 'next/navigation'

import { cn } from '@/utilities/cn'

export const LanguageToggle = () => {
  const router = useRouter()
  const locale = useLocale()
  const { startRouteTransition } = useRouteTransition()
  const { setLocaleIsLoading } = useLocaleLoading()

  return (
    <button
      type="button"
      className={cn('btn btn--style-secondary h-8 w-12 p-0 m-0 bg-white text-primary font-mono relative')}
      onClick={() => {
        setLocaleIsLoading(true)
        const url = new URL(window.location.href)
        if (locale.code === 'en') url.searchParams.set('locale', 'de')
        if (locale.code === 'de') url.searchParams.set('locale', 'en')
        startRouteTransition(() => {
          router.push(url.toString())
        })
      }}
    >
      <span className={cn([
        'absolute top-0 left-0.5',
        locale.code === 'en' ? 'text-primary' : 'text-gray-400',
      ])}>EN</span>
      <span className={cn([
        'absolute left-1/2 top-1/2 px-1',
        '-translate-1/2 bg-white rotate-30',
        'before:content-[\'\'] before:block before:w-[2px] before:h-[1.25em] before:bg-primary',
      ])} />
      <span className={cn([
        'absolute bottom-0 right-0.5',
        locale.code === 'de' ? 'text-primary' : 'text-gray-400',
      ])}>DE</span>
    </button>
  )
}
