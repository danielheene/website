import { memo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { cn } from '@/utilities/cn'
import { LogoCloudEntry } from '../LogoCloud.shared'
import { LogoCarouselRow } from './LogoCarouselRow'

interface LogoCarouselProps {
  chunks: [LogoCloudEntry, LogoCloudEntry][]
}

export const LogoCarousel = memo(({ chunks }: LogoCarouselProps) => {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      axis: 'y',
      startIndex: 1,
    },
    [Autoplay()],
  )

  return (
    <div
      className={cn([
        'mx-auto lg:mx-0 ',
        'flex flex-row gap-6 h-128',
        'overflow-hidden',
        'pointer-events-none',
        'lg:col-span-6',
        'select-none',
        'relative',
        'before:absolute before:top-0 before:z-10 before:h-16 before:w-full before:bg-gradient-to-b before:from-secondary before:to-transparent',
        'after:absolute after:bottom-0 after:z-10 after:h-16 after:w-full after:bg-gradient-to-t after:from-secondary after:to-transparent',
      ])}
      ref={emblaRef}
    >
      <div className={cn(['flex flex-col direction-reverse w-full'])}>
        {chunks.map((rowItems) => (
          <LogoCarouselRow key={rowItems.reduce((str, { id }) => str + id, '')} items={rowItems} />
        ))}
      </div>
    </div>
  )
})

LogoCarousel.displayName = 'LogoCarousel'
