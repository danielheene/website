import { FC, Fragment } from 'react'

import { cn } from '@repo/utils/cn'

export const defaultFontWeight: number = 400
export const defaultSampleText: string = 'Heavy boxes perform quick waltzes and jigs.'
export const defaultFontSizes: string[] = [
  'text-xs',
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
  'text-5xl',
  'text-6xl',
  'text-7xl',
  'text-8xl',
  'text-9xl',
]

export interface TypesetProps {
  fontFamily: string
  fontSizes?: string[]
  fontWeight?: number
  sampleText?: string
}

/**
 * Convenient styleguide documentation showing examples of type with different sizes and weights and
 * configurable sample text.
 */
export const Typeset: FC<TypesetProps> = (props) => {
  const {
    fontFamily,
    fontSizes = defaultFontSizes,
    fontWeight = defaultFontWeight,
    sampleText = defaultSampleText,
  } = props

  return (
    <div
      className={cn(
        'rounded-md border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.10)] dark:shadow-[0_2px_5px_rgba(0,0,0,0.20)]',
        'docblock-typeset sb-unstyled grid grid-cols-[min-content_auto] items-baseline my-[25px] mb-10 p-[30px_20px]',
      )}
    >
      {fontSizes.map(
        (size) =>
          defaultFontSizes.includes(size) && (
            <Fragment key={size}>
              <header
                className={cn([
                  'mr-7.5 text-[1em] pr-[1em]',
                  'text-foreground/40 dark:text-foreground/60',
                ])}
              >
                {size.replace('text-', '')}
              </header>
              <div
                className={cn([
                  'text-ellipsis overflow-hidden whitespace-nowrap',
                  `text-${size} font-[${fontWeight}]`,
                  size,
                ])}
                style={{
                  fontFamily,
                  fontWeight,
                  lineHeight: 1.2,
                }}
              >
                {sampleText || 'Was he a beast if music could move him so?'}
              </div>
            </Fragment>
          ),
      )}
    </div>
  )
}
