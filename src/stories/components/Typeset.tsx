import React, { FC, Fragment } from 'react'

import { transparentize } from 'polished'
import { styled, Theme } from '@storybook/theming'
import { withReset, H2 } from '@storybook/components'

export const getBlockBackgroundStyle: (theme: Theme) => object = (theme: Theme) => ({
  borderRadius: theme.appBorderRadius,
  background: theme.background.content,
  boxShadow:
    theme.base === 'light' ? 'rgba(0, 0, 0, 0.10) 0 1px 3px 0' : 'rgba(0, 0, 0, 0.20) 0 2px 5px 0',
  border: `1px solid ${theme.appBorderColor}`,
})

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
//
// const TypeSpecimen = styled.div({
//   display: 'flex',
//   flexDirection: 'row',
//   alignItems: 'baseline',
//   '&:not(:last-child)': { marginBottom: '1rem' },
// })

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
        <Label style={{ fontSize: '1em', paddingRight: '1em' }}>{label}</Label>
        <Sample
          style={{
            fontFamily,
            fontSize: size,
            fontWeight,
            lineHeight: 1.2,
          }}
        >
          {sampleText || 'Was he a beast if music could move him so?'}
        </Sample>
      </Fragment>
    ))}
  </Wrapper>
)
