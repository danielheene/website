import type { JSX } from 'react'

import { cn } from 'tailwind-variants'

import { Icon } from '@/components/Icon'
import { ImageMedia } from '@/components/ImageMedia/ImageMedia'
import RichText from '@/components/RichText'
import { collectMediaCredits } from '@/lib/collectMediaCredits'

/**
 * Lists every media asset that carries a credit line and is actually used
 * somewhere on the site, alongside the pages referencing it.
 *
 * Assets with credits that are not referenced anywhere are intentionally
 * omitted — an attribution list should cover what is published, nothing more.
 */
export const LegalAuthorshipsBlockRenderer = async (): Promise<JSX.Element | null> => {
  const credits = await collectMediaCredits()

  if (credits.length === 0) return null

  return (
    <section>
      <h2 className="text-3xl font-mono font-semibold mb-4">Attributions / Resource Credits</h2>

      <ul
        className={cn([
          'flex flex-col gap-6 list-none p-0 m-0',
        ])}
      >
        {credits.map((credit) => (
          <li key={`${credit.collection}:${credit.id}`} className="flex flex-row gap-4 items-start">
            <div className="relative shrink-0 w-24 aspect-4/3 overflow-hidden bg-muted flex items-center justify-center">
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

            <div className="flex flex-col py-1 gap-1">
              <RichText
                data={credit.credits}
                enableGutter={false}
                enableProse={false}
                className="text-base leading-snug"
              />

              {credit.usages.length > 0 && (
                <p className="flex flex-wrap gap-x-2 gap-y-1 text-sm font-mono opacity-80">
                  <span className="font-medium">Used on:</span>
                  <span className="flex flex-wrap gap-x-2 gap-y-1">
                    {credit.usages.map(({ collection, label }) => (
                      <span key={`${collection}:${label}`}>{label}</span>
                    ))}
                  </span>
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default LegalAuthorshipsBlockRenderer
