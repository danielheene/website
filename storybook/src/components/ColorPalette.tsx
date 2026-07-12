import React, { Fragment, FunctionComponent } from 'react'

import { styled } from 'storybook/theming'
import { readableColor, transparentize } from 'polished'

import { getBlockBackgroundStyle } from './_shared'

const ItemTitle = styled.div(({ theme }) => ({
  fontWeight: theme.typography.weight.bold,
  color: theme.color.defaultText,
}))

const ItemSubtitle = styled.div(({ theme }) => ({
  color:
    theme.base === 'light'
      ? transparentize(0.2, theme.color.defaultText)
      : transparentize(0.6, theme.color.defaultText),
}))

const ItemDescription = styled.div({
  flex: '0 0 30%',
  lineHeight: '20px',
  marginTop: 5,
})

const SwatchLabel = styled.div(({ theme }) => ({
  flex: 1,
  textAlign: 'center',
  fontFamily: theme.typography.fonts.mono,
  fontSize: theme.typography.size.s1,
  lineHeight: 1,
  overflow: 'hidden',
  color:
    theme.base === 'light'
      ? transparentize(0.4, theme.color.defaultText)
      : transparentize(0.6, theme.color.defaultText),

  '> div': {
    display: 'inline-block',
    overflow: 'hidden',
    maxWidth: '100%',
    textOverflow: 'ellipsis',
  },

  span: {
    display: 'block',
    marginTop: 2,
  },
}))



const SwatchLabels = styled.div({
  display: 'flex',
  flexDirection: 'row',
})

interface SwatchProps {
  background: string
}

const Swatch = styled.div<SwatchProps>(({ background }) => ({
  position: 'relative',
  flex: 1,

  '&::before': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background,
    content: '""',
  },
}))

const SwatchColors = styled.div(({ theme }) => ({
  ...getBlockBackgroundStyle(theme),
  display: 'flex',
  flexDirection: 'row',
  height: 50,
  marginBottom: 10,
  overflow: 'hidden',
  backgroundColor: 'white',
  backgroundImage: `repeating-linear-gradient(-45deg, #ccc, #ccc 1px, #fff 1px, #fff 16px)`,
  backgroundClip: 'padding-box',
}))

const SwatchSpecimen = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  position: 'relative',
  marginBottom: 30,
})

const Swatches = styled.div({
  flex: 1,
  display: 'flex',
  flexDirection: 'row',
})

const PrimarySwatchColor = styled(SwatchColors)(() => ({
  marginBottom: -2,
  borderBottomRightRadius: 0,
  borderBottomLeftRadius: 0,
  [`& + .swatch-colors`]: {
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
  },
}))

const PrimaryLabel = styled.span(({ theme, color }) => ({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: color,
  fontWeight: theme.typography.weight.bold,
  fontFamily: theme.typography.fonts.mono,
}))

const Item = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
})

const ListName = styled.div({
  flex: '0 0 30%',
})

const ListSwatches = styled.div({
  flex: 1,
})

const ListHeading = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  paddingBottom: 20,
  fontWeight: theme.typography.weight.bold,
  color:
    theme.base === 'light'
      ? transparentize(0.4, theme.color.defaultText)
      : transparentize(0.6, theme.color.defaultText),
}))

const List = styled.div(({ theme }) => ({
  fontSize: theme.typography.size.s2,
  lineHeight: `20px`,

  display: 'flex',
  flexDirection: 'column',
}))

type Colors = string[] | { [key: string]: string }

interface ColorItemProps {
  title: string
  subtitle: string
  colors: Colors
}

function renderSwatch(color: string, index: number) {
  return <Swatch key={`${color}-${index}`} title={color} background={color} />
}

function renderSwatchLabel(color: string, index: number, colorDescription?: string) {
  return (
    <SwatchLabel key={`${color}-${index}`} title={color}>
      <div>
        {color}
        {colorDescription && colorDescription !== color && <span>{colorDescription}</span>}
      </div>
    </SwatchLabel>
  )
}

function renderSwatchSpecimen(colors: Colors) {
  if (Array.isArray(colors)) {
    return (
      <SwatchSpecimen>
        <SwatchColors>{colors.map((color, index) => renderSwatch(color, index))}</SwatchColors>
        <SwatchLabels>{colors.map((color, index) => renderSwatchLabel(color, index))}</SwatchLabels>
      </SwatchSpecimen>
    )
  }

  const swatchElements = []
  const labelElements = []

  for (const colorKey in colors) {
    if (colorKey === 'DEFAULT') break

    const colorValue = colors[colorKey]
    swatchElements.push(renderSwatch(colorValue, swatchElements.length))
    labelElements.push(renderSwatchLabel(colorKey, labelElements.length, colorValue))
  }

  let primarySwatch = <Fragment />
  if ('DEFAULT' in colors) {
    const primaryColor = colors['DEFAULT']
    const primaryLabelColor = transparentize(0.1, readableColor(primaryColor))

    primarySwatch = (
      <PrimarySwatchColor>
        <Swatch background={primaryColor}>
          <PrimaryLabel color={primaryLabelColor}>{primaryColor}</PrimaryLabel>
        </Swatch>
      </PrimarySwatchColor>
    )
  }

  return (
    <SwatchSpecimen>
      {primarySwatch}
      <SwatchColors className="swatch-colors">{swatchElements}</SwatchColors>
      <SwatchLabels>{labelElements}</SwatchLabels>
    </SwatchSpecimen>
  )
}

/**
 * A single color row your styleguide showing title, subtitle and one or more colors, used as a
 * child of `ColorPalette`.
 */
export const ColorItem: FunctionComponent<ColorItemProps> = ({ title, subtitle, colors }) => {
  return (
    <Item>
      <ItemDescription>
        <ItemTitle>{title}</ItemTitle>
        <ItemSubtitle>{subtitle}</ItemSubtitle>
      </ItemDescription>
      <Swatches>{renderSwatchSpecimen(colors)}</Swatches>
    </Item>
  )
}

interface ColorPaletteProps {
  children?: React.ReactNode
}

/**
 * Styleguide documentation for colors, including names, captions, and color swatches, all specified
 * as `ColorItem` children of this wrapper component.
 */
export const ColorPalette: FunctionComponent<ColorPaletteProps> = ({ children, ...props }) => (
  <ResetWrapper>
    <List {...props} className="docblock-colorpalette sb-unstyled">
      <ListHeading>
        <ListName>Name</ListName>
        <ListSwatches>Swatches</ListSwatches>
      </ListHeading>
      {children}
    </List>
  </ResetWrapper>
)
