import type { FunctionComponent } from 'react'
import React from 'react'

import { ResetWrapper } from '@storybook//components'
import { styled } from '@storybook/theming'

import { getBlockBackgroundStyle } from './_shared'

const ItemLabel = styled.div(({ theme }) => ({
  fontFamily: theme.typography.fonts.mono,
  fontSize: theme.typography.size.s2,
  fontWeight: theme.typography.weight.bold,
  color: theme.color.defaultText,
  marginTop: '1em',
  lineHeight: 1.2,
  textAlign: 'center',
}))

const ItemSpecimen = styled.div(({ theme }) => ({
  ...getBlockBackgroundStyle(theme),
  overflow: 'hidden',
  fontSize: '3rem',
  height: '2em',
  width: '2em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 'none',

  '> img, > svg': {
    width: '1em',
    height: '1em',
  },
}))

const Item = styled.div({
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: '0 1 calc(20% - 50px)',
  minWidth: 120,

  margin: '15px',
})

const List = styled.div({
  display: 'flex',
  flexFlow: 'row wrap',
})

interface IconItemProps {
  name: string
  children?: React.ReactNode
}

/** An individual icon with a caption and an example (passed as `children`). */
export const IconItem: FunctionComponent<IconItemProps> = ({ name, children }) => (
  <Item>
    <ItemSpecimen
      onClick={async () => {
        if (navigator) await navigator.clipboard.writeText(name)
      }}
    >
      {children}
    </ItemSpecimen>
    <ItemLabel>{name}</ItemLabel>
  </Item>
)

interface IconGalleryProps {
  children?: React.ReactNode
}

/** Show a grid of icons, as specified by `IconItem`. */
export const IconGallery: FunctionComponent<IconGalleryProps> = ({ children, ...props }) => (
  <ResetWrapper>
    <List {...props} className="docblock-icongallery sb-unstyled">
      {children}
    </List>
  </ResetWrapper>
)
