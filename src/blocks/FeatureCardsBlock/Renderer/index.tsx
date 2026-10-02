import type { JSX } from 'react'

import { cn } from 'tailwind-variants'

import type { FeatureCardColor, FeatureCardSize } from '@/blocks/FeatureCardsBlock'
import { Headline } from '@/components/Headline'
import { ImageMedia } from '@/components/ImageMedia'
import { CMSLink } from '@/components/Link'
import { Reveal } from '@/components/Reveal'
import type { FeatureCardsBlock } from '@/types/payload'

type FeatureCard = NonNullable<FeatureCardsBlock['cards']>[number]

/** Column spans on the 2-column (md) and 6-column (lg) grid. */
const SIZE_CLASSES: Record<FeatureCardSize, string> = {
  third: 'lg:col-span-2',
  half: 'lg:col-span-3',
  twoThirds: 'md:col-span-2 lg:col-span-4',
  full: 'md:col-span-2 lg:col-span-6',
}

/** Literal class strings, so Tailwind picks every gradient up. */
const COLOR_CLASSES: Record<FeatureCardColor, string> = {
  primary: 'from-primary-300 via-primary-500 to-primary-800',
  rose: 'from-pink-300 via-rose-500 to-rose-800',
  violet: 'from-violet-300 via-violet-500 to-indigo-800',
  sky: 'from-sky-300 via-blue-500 to-blue-800',
  teal: 'from-teal-300 via-teal-600 to-emerald-900',
  amber: 'from-amber-200 via-orange-500 to-orange-800',
}

const FeatureCardItem = ({ size, color, title, text, image, link }: FeatureCard) => {
  const resolvedSize = (size ?? 'third') as FeatureCardSize
  const resolvedColor = (color ?? 'primary') as FeatureCardColor
  // Wide cards place the image beside the text; a third is too narrow, so it
  // stacks below like every card does on small screens.
  const sideImage = resolvedSize !== 'third'
  const media = image && typeof image === 'object' ? image : null

  return (
    <article
      data-reveal-item
      className={cn([
        'group relative isolate flex min-h-80 flex-col overflow-hidden rounded-2xl',
        'bg-linear-to-b text-white',
        COLOR_CLASSES[resolvedColor] ?? COLOR_CLASSES.primary,
        SIZE_CLASSES[resolvedSize] ?? SIZE_CLASSES.third,
      ])}
    >
      {/* Soft light from the top, then grain over everything. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgb(255_255_255/0.35),transparent)]"
      />
      <div
        aria-hidden
        className="bg-grain pointer-events-none absolute inset-0 -z-10 opacity-35 mix-blend-overlay"
      />

      <div
        className={cn([
          // Not positioned: the link's stretched ::after must resolve against the card.
          'flex flex-col gap-4 p-8 sm:p-10',
          sideImage && 'lg:my-auto lg:max-w-[55%]',
        ])}
      >
        <h3 className="text-3xl leading-tight font-semibold text-balance whitespace-pre-line sm:text-4xl">
          {title}
        </h3>
        {text && (
          <p className="max-w-md text-base text-white/80 text-pretty whitespace-pre-line">{text}</p>
        )}
        {link && (
          <CMSLink
            {...link}
            variant="link"
            className={cn([
              'mt-2 self-start [--button-text-color:var(--color-white)]!',
              // Stretches the click target over the whole card, image included.
              "after:absolute after:inset-0 after:z-10 after:content-['']",
            ])}
          />
        )}
      </div>

      {media?.url && (
        <div
          className={cn([
            'relative mt-auto ml-auto w-[88%] translate-y-4 overflow-hidden rounded-tl-xl',
            'shadow-2xl ring-1 ring-white/15 transition-transform duration-500',
            'group-hover:translate-y-1',
            sideImage &&
              'lg:absolute lg:right-0 lg:bottom-0 lg:w-[42%] lg:translate-y-[12%] lg:group-hover:translate-y-[8%]',
          ])}
        >
          <ImageMedia
            url={media.url}
            alt={media.alt ?? ''}
            width={media.width ?? undefined}
            height={media.height ?? undefined}
            blurDataURL={media.blurDataURL}
            sizes="(min-width: 1024px) 40vw, 90vw"
            imgClassName="block h-auto w-full"
          />
        </div>
      )}
    </article>
  )
}

/**
 * Bento grid of gradient cards (see `FeatureCardsBlock`). Server Component;
 * only `Reveal` and `ImageMedia` hydrate.
 */
export const FeatureCardsBlockRenderer = ({
  heading,
  cards,
}: FeatureCardsBlock): JSX.Element | null => {
  if (!cards?.length) return null

  return (
    <section className="container py-16 sm:py-20">
      {heading && (
        <Headline variant="section" className="mb-8">
          {heading}
        </Headline>
      )}
      <Reveal className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        {cards.map((card, index) => (
          <FeatureCardItem key={card.id ?? index} {...card} />
        ))}
      </Reveal>
    </section>
  )
}
