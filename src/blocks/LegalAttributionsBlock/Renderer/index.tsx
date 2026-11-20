import type { JSX } from 'react'
import Link from 'next/link'

import { cn } from 'tailwind-variants'

import { Attribution } from '@/components/Attribution'
import { Icon } from '@/components/Icon'
import { ImageMedia } from '@/components/ImageMedia/ImageMedia'
import { collectMediaCredits, type MediaCreditUsage } from '@/lib/collectMediaCredits'

/** "Title (Page)", linked when the document has its own URL. */
const Usage = ({ title, collectionLabel, href }: MediaCreditUsage) => {
  const label = title ? `${title} (${collectionLabel})` : collectionLabel

  return href ? (
    <Link href={href} className="underline">
      {label}
    </Link>
  ) : (
    <>{label}</>
  )
}

/**
 * Lists every media asset that carries an attribution and is used somewhere
 * the public can see, alongside the documents using it.
 *
 * Unused assets are intentionally omitted: an attribution list should cover
 * what is published, nothing more.
 */
export const LegalAttributionsBlockRenderer = async (): Promise<JSX.Element | null> => {
  const credits = await collectMediaCredits()

  if (credits.length === 0) return null

  return (
    <section>
      <ul className={cn(['m-0 flex list-none flex-col gap-6 p-0'])}>
        {credits.map((credit) => (
          <li key={`${credit.collection}:${credit.id}`} className="flex flex-row items-start gap-4">
            <div className="relative flex aspect-4/3 w-24 shrink-0 items-center justify-center overflow-hidden bg-muted">
              {credit.thumbnailUrl ? (
                <ImageMedia
                  url={credit.thumbnailUrl}
                  alt={credit.filename}
                  fill
                  imgClassName="object-contain w-full h-full "
                />
              ) : (
                <Icon name="material-symbols:music-note" className="text-2xl opacity-60" />
              )}
            </div>

            <div className="flex flex-col gap-1 py-1">
              <Attribution attribution={credit.attribution} className="text-base leading-snug" />

              {credit.usages.length > 0 && (
                <p className="m-0 font-mono text-sm opacity-80">
                  <span className="font-medium">Used on: </span>
                  {credit.usages.map((usage, index) => (
                    <span key={`${usage.collection}:${usage.href ?? usage.title}`}>
                      {index > 0 && ', '}
                      <Usage {...usage} />
                    </span>
                  ))}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default LegalAttributionsBlockRenderer
