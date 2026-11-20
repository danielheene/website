import type { ReactNode } from 'react'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { cn } from 'tailwind-variants'

import RichText from '@/components/RichText'
import type { AttributionCredit, ResolvedAttribution } from '@/lib/attribution'

type AttributionProps = {
  attribution: ResolvedAttribution
  className?: string
}

const ExternalLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
    {children}
  </a>
)

const Credit = ({ credit }: { credit: AttributionCredit }) =>
  credit.url ? <ExternalLink href={credit.url}>{credit.name}</ExternalLink> : <>{credit.name}</>

/** "Author [Studio] · License", then the notes. */
export const Attribution = ({ attribution, className }: AttributionProps) => {
  const { author, studio, license, notes } = attribution

  return (
    <div className={cn(['flex flex-col gap-1', className])}>
      {(author || studio || license) && (
        <p className="m-0">
          {author && <Credit credit={author} />}
          {author && studio && ' ['}
          {studio && <Credit credit={studio} />}
          {author && studio && ']'}
          {license && (
            <span className="opacity-80">
              {(author || studio) && ' · '}
              {license.url ? (
                <ExternalLink href={license.url}>{license.label}</ExternalLink>
              ) : (
                license.label
              )}
            </span>
          )}
        </p>
      )}

      {notes && (
        <RichText
          // SAFETY: resolveAttribution only keeps notes that are a Lexical state with text.
          data={notes as DefaultTypedEditorState}
          enableGutter={false}
          enableProse={false}
        />
      )}
    </div>
  )
}
