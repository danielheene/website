import type { JSX } from 'react'

import { cn } from 'tailwind-variants'

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
      <ul
        className={cn([
          'flex flex-col gap-6 list-none p-0 m-0',
        ])}
      >
        {credits.map((credit) => (
          <li key={`${credit.collection}:${credit.id}`} className="flex flex-col gap-1">
            <p className="flex flex-wrap gap-x-2 text-sm font-mono opacity-80">
              <span className="font-medium">{credit.filename}</span>
              {credit.usages.length > 0 && (
                <span>on {credit.usages.map(({ label }) => label).join(', ')}</span>
              )}
            </p>

            <RichText
              data={credit.credits}
              enableGutter={false}
              enableProse={false}
              className="text-base leading-snug"
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default LegalAuthorshipsBlockRenderer
