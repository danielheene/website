import { FC, Fragment } from 'react'

import { cn } from '../lib/cn'
import { blockBackgroundClassName } from './_shared'

export interface TypesetProps {
  fontFamily?: string
  fontSizes: [string | number, string | number][]
  fontWeight?: number
  sampleText?: string
}

/**
 * Convenient styleguide documentation showing examples of type with different sizes and weights and
 * configurable sample text.
 */
export const Typeset: FC<TypesetProps> = ({
  fontFamily,
  fontSizes,
  fontWeight,
  sampleText,
  ...props
}) => (
  <div
    {...props}
    className={cn(
      blockBackgroundClassName,
      'docblock-typeset sb-unstyled grid grid-cols-[min-content_auto] items-baseline my-[25px] mb-10 p-[30px_20px]',
    )}
  >
    {fontSizes.map(([label, size]) => (
      <Fragment key={label}>
        <header
          className={cn(['mr-[30px] text-[1em] pr-[1em]', 'text-foreground/40 dark:text-foreground/60'])}
          style={{ fontSize: '1em', paddingRight: '1em' }}
        >
          {label}
        </header>
        <div
          className="text-ellipsis overflow-hidden whitespace-nowrap"
          style={{
            fontFamily,
            fontSize: size,
            fontWeight,
            lineHeight: 1.2,
          }}
        >
          {sampleText || 'Was he a beast if music could move him so?'}
        </div>
      </Fragment>
    ))}
  </div>
)
