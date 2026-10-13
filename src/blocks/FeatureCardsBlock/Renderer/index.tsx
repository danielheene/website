import type { JSX } from 'react'
import Link from 'next/link'

import { cn } from 'tailwind-variants'

import type { FeatureCardColor, FeatureCardSize } from '@/blocks/FeatureCardsBlock'
import { Button } from '@/components/Button'
import { Headline } from '@/components/Headline'
import { ImageMedia } from '@/components/ImageMedia'
import { Reveal } from '@/components/Reveal'
import { resolveLinkProps } from '@/fields/Link/lib/resolveLinkProps'
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
  primary: 'from-primary-400 via-primary-600 to-primary-950 text-white',
  secondary: 'from-secondary-400 via-secondary-600 to-secondary-950 text-white',
  slate: 'from-slate-400 via-slate-600 to-slate-950 text-white',
  gray: 'from-gray-400 via-gray-600 to-gray-950 text-white',
  zinc: 'from-zinc-400 via-zinc-600 to-zinc-950 text-white',
  neutral: 'from-neutral-400 via-neutral-600 to-neutral-950 text-white',
  stone: 'from-stone-400 via-stone-600 to-stone-950 text-white',
  red: 'from-red-400 via-red-600 to-red-950 text-white',
  orange: 'from-orange-400 via-orange-600 to-orange-950 text-white',
  amber: 'from-amber-400 via-amber-600 to-amber-950 text-black',
  yellow: 'from-yellow-400 via-yellow-600 to-yellow-950 text-black',
  lime: 'from-lime-400 via-lime-600 to-lime-950 text-black',
  green: 'from-green-400 via-green-600 to-green-950 text-white',
  emerald: 'from-emerald-400 via-emerald-600 to-emerald-950 text-white',
  teal: 'from-teal-400 via-teal-600 to-teal-950 text-white',
  cyan: 'from-cyan-400 via-cyan-600 to-cyan-950text-black',
  sky: 'from-blue-400 via-blue-600 to-blue-950 text-black',
  blue: 'from-blue-400 via-blue-600 to-blue-950 text-white',
  indigo: 'from-indigo-400 via-indigo-600 to-indigo-950 text-white',
  violet: 'from-violet-400 via-violet-600 to-violet-950 text-white',
  purple: 'from-purple-400 via-purple-600 to-purple-950 text-white',
  fuchsia: 'from-fuchsia-400 via-fuchsia-600 to-fuchsia-950 text-black',
  pink: 'from-pink-400 via-pink-600 to-pink-950 text-white',
  rose: 'from-rose-400 via-rose-600 to-rose-950 text-white',
  info: 'from-info-400 via-info-600 to-info-950 text-white',
  success: 'from-success-400 via-success-600 to-success-950 text-white',
  warning: 'from-warning-400 via-warning-600 to-warning-950 text-white',
  error: 'from-error-400 via-error-600 to-error-950 text-white',
}

const FeatureCardItem = ({ size, color, title, text, image, link }: FeatureCard) => {
  const resolvedSize = (size ?? 'third') as FeatureCardSize
  const resolvedColor = (color ?? 'primary') as FeatureCardColor
  // Wide cards place the image beside the text; a third is too narrow, so it
  // stacks below like every card does on small screens.
  const sideImage = resolvedSize !== 'third'
  const media = image && typeof image === 'object' ? image : null
  const linkProps = resolveLinkProps(link)
  const Component = linkProps ? Link : 'article'

  return (
    <Component
      {...linkProps}
      data-reveal-item
      className={cn([
        'group relative isolate flex min-h-80 flex-col overflow-hidden rounded-xl',
        'bg-linear-to-tr text-white',
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
          'flex flex-col gap-6 p-8 sm:p-10',
          sideImage && 'lg:my-auto lg:max-w-[55%]',
        ])}
      >
        <h3 className="text-3xl leading-[1.1] font-medium font-mono text-balance whitespace-pre-line sm:text-4xl">
          {title}
        </h3>
        {text && (
          <p className="max-w-md text-base text-white/90 text-pretty whitespace-pre-line">{text}</p>
        )}
        {link && (
          <Button
            variant="inverse"
            className={cn(['mt-2 self-start'])}
            startIcon={link.iconBefore}
            endIcon={link.iconAfter}
            asChild
          >
            <span>{link.text}</span>
          </Button>
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
    </Component>
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
