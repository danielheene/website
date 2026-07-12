import React, { FC, Fragment } from 'react'

import { transparentize } from 'polished'
import { styled } from 'storybook/theming'
import { withReset } from 'storybook/internal/components'

import { getBlockBackgroundStyle } from './_shared'

const Label = styled.div(({ theme }) => ({
  marginRight: 30,
  fontSize: `${theme.typography.size.s1}px`,
  color:
    theme.base === 'light'
      ? transparentize(0.4, theme.color.defaultText)
      : transparentize(0.6, theme.color.defaultText),
}))

const Sample = styled.div({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
})

const Wrapper = styled.div(withReset, ({ theme }) => ({
  ...getBlockBackgroundStyle(theme),
  display: 'grid',
  gridTemplateColumns: 'min-content auto',
  alignItems: 'baseline',
  margin: '25px 0 40px',
  padding: '30px 20px',
}))

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
  <Wrapper {...props} className="docblock-typeset sb-unstyled">
    {fontSizes.map(([label, size]) => (
      <Fragment key={label}>
        <header
          className={cn(['mr-[30px] text-[1em] pr-[1em]', 'text-foreground/40 dark:text-foreground/60'])}
          style={{ fontSize: '1em', paddingRight: '1em' }}>{label}</header>
        <div
          className="text-ellipsis"
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
  </Wrapper>
)
