import { Media } from '@payload-types'
import { cn } from '@/utilities/cn'
import { ImageMedia } from '@/components/ImageMedia'
import RichText from '@/components/RichText'
import { SectionContainer } from './SectionContainer'
import { SectionProps } from '@custom-types'

export const ResumeHeroSection = ({
  className,
  title,
  caption,
  background: backgroundMedia,
  portrait: portraitMedia,
}: SectionProps<'resumeHero'>) => {
  const background = backgroundMedia as Media
  const portrait = portraitMedia as Media

  const titleRows = title?.split('\n')

  return (
    <SectionContainer
      className={cn([
        'w-full h-screen relative pt-32 -mt-32 text-white border-b-4 border-primary',
        className,
      ])}
    >
      {background && (
        <ImageMedia
          url={background.url}
          alt={background.alt}
          blurHash={background.blurHash}
          width={background.width}
          height={background.height}
          loading="lazy"
          className="absolute top-0 right-0 left-0 bottom-0 z-0"
          fill
          duoTone
        />
      )}
      <div className="container h-full grid grid-cols-12 items-center relative">
        <div className="col-span-10 col-start-2 md:col-span-5 md:col-start-2 text-center md:text-left">
          {title && (
            <h1>
              {titleRows.map((row, index) => (
                <span
                  key={index}
                  className={cn([
                    'font-pp-supply-mono text-3xl sm:text-4xl md:text-5xl xl:text-6xl bg-clip-text bg-white',
                  ])}
                >
                  {row}
                  <br />
                </span>
              ))}
            </h1>
          )}
          {caption && <RichText content={caption} enableGutter={false} />}
        </div>
        <div className="col-span-10 col-start-2 sm:col-span-6 sm:col-start-4 md:col-span-4 md:col-start-8 mb-auto md:mb-0">
          {portrait && (
            <ImageMedia
              url={portrait.url}
              alt={portrait.alt}
              blurHash={portrait.blurHash}
              width={portrait.width}
              height={portrait.height}
              loading="lazy"
              className={cn(
                'w-full aspect-square rounded-full',
                'bg-gradient-to-tr from-primary-500 to-primary-700',
                'border-4 border-white opacity-0 transition-opacity duration-200',
              )}
              loadedClassName="opacity-100"
              fill
            />
          )}
        </div>
      </div>
    </SectionContainer>
  )
}
