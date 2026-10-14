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
      <h2 className="mb-4 font-mono text-3xl font-semibold">Attributions / Resource Credits</h2>

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
              <RichText
                data={credit.credits}
                enableGutter={false}
                enableProse={false}
                className="text-base leading-snug"
              />

              {credit.usages.length > 0 && (
                <p className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-sm opacity-80">
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
