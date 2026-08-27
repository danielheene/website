import { type JSX, useMemo } from 'react'

import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { cn } from 'tailwind-variants'

import { ResumeCustomerData } from '@/types/payload'

type LogoCarouselRow = [
  Pick<ResumeCustomerData, 'id' | 'svg' | 'title'>,
  Pick<ResumeCustomerData, 'id' | 'svg' | 'title'>,
]

export interface LogoCarouselProps {
  entries: Pick<ResumeCustomerData, 'id' | 'svg' | 'title'>[]
  className?: string
}

export const LogoCarousel = ({ className, entries }: LogoCarouselProps) => {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      axis: 'y',
      startIndex: 1,
    },
    [
      Autoplay(),
    ],
  )

  const getRowKey = (entries: LogoCarouselProps['entries']): string => {
    return entries.reduce((prev, curr, index) => {
      return index === 1 ? curr.id : `${prev}-${curr.id}`
    }, '')
  }

  const rows = useMemo(
    (): LogoCarouselRow[] =>
      entries
        .reduce((previousValue, currentValue, index) => {
          const rowIndex = Math.floor(index / 2)
          const tileIndex = index % 2

          previousValue[rowIndex] = previousValue[rowIndex] || []
          previousValue[rowIndex][tileIndex] = currentValue
          return previousValue
        }, [])
        .filter((row) => row.length === 2),
    [
      entries,
    ],
  )

  return (
    <div
      style={{
        maskImage: 'linear-gradient( transparent 0%, black 30%, black 70%, transparent 100%)',
      }}
      className={cn([
        'mx-auto',
        'flex flex-row',
        'overflow-hidden',
        'pointer-events-none',
        'aspect-4/3',
        'w-full',
        'select-none',
        'relative',
        className,
      ])}
      ref={emblaRef}
    >
      <div
        className={cn([
          'flex flex-col w-full shrink-0 grow-0 direction-reverse',
        ])}
      >
        {rows.filter(Boolean).map((row) => (
          <LogoCarouselRow key={getRowKey(row)} entries={row} />
        ))}
      </div>
    </div>
  )
}

export function LogoCarouselRow({ entries }: { entries: LogoCarouselProps['entries'] }) {
  return (
    <div
      className={cn([
        'flex flex-row shrink-0 grow-0 my-3 gap-6',
      ])}
    >
      {entries.map((item) => (
        <LogoCarouselTile key={item.id} {...item} />
      ))}
    </div>
  )
}

export function LogoCarouselTile({
  id,
  svg,
  title,
}: LogoCarouselProps['entries'][number]): JSX.Element {
  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: <TODO>
    <div
      key={id}
      aria-label={title}
      className={cn(
        'aspect-4/3 w-full p-3 rounded',
        'fill-primary bg-white',
        '*:w-full *:h-full *:object-contain *:object-center',
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <sanitized server-side by sanitizeSvg — on write via the ResumeCustomers beforeChange hook, and again in ResumeCustomersBlock/Renderer before reaching this component>
      dangerouslySetInnerHTML={{
        __html: svg,
      }}
    />
  )
}
