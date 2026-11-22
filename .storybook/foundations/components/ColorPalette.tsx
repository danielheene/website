import type { FunctionComponent, ReactNode } from 'react'

import { cn } from 'tailwind-variants'

import { TooltipProvider } from '@/components/AdminPanel/TooltipProvider'
import { Tooltip } from '@/components/Tooltip'

import colorsCss from '@/styles/theme/_colors.css?raw'

/** Every `--color-*` declared in `_colors.css`, read from the file so the docs can't drift from it. */
const TOKENS = new Map(
  [...colorsCss.matchAll(/(--color-[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
    name,
    value.replace(/\s+/g, ' ').trim(),
  ]),
)

const SHADE = /^--color-([a-z]+)-(\d+)$/

/** Families with a shade scale (`--color-<family>-<shade>`), in the file's order. */
// a scale needs a 500 shade, which leaves out `--color-chart-1…5` (theme tokens, not a scale)
const FAMILIES = [
  ...new Set([...TOKENS.keys()].flatMap((name) => SHADE.exec(name)?.[1] ?? [])),
].filter((family) => TOKENS.has(`--color-${family}-500`))

const LIGHT_DARK = /^light-dark\((.+)\)$/

/** Splits `light-dark(a, b)` at its top-level comma. */
const splitLightDark = (value: string): [string, string] | null => {
  const inner = LIGHT_DARK.exec(value)?.[1]

  if (!inner) return null

  let depth = 0

  for (let index = 0; index < inner.length; index++) {
    if (inner[index] === '(') depth++

    if (inner[index] === ')') depth--

    if (inner[index] === ',' && depth === 0) {
      return [inner.slice(0, index).trim(), inner.slice(index + 1).trim()]
    }
  }

  return null
}

/** The light and dark value of a theme pair; null when both themes share one value. */
const themeValues = (value: string): [string, string] | null => {
  const pair = splitLightDark(value)

  return pair && pair[0] !== pair[1] ? pair : null
}

/** A single-value token's color: follows `var(--color-*)` and unwraps `light-dark(a, a)`. */
const resolve = (value: string): string => {
  const reference = /^var\((--color-[\w-]+)\)$/.exec(value)?.[1]
  const target = reference && TOKENS.get(reference)

  if (target) return resolve(target)

  return splitLightDark(value)?.[0] ?? value
}

const SWATCH_FRAME = cn([
  'flex w-full overflow-hidden rounded-md border border-border bg-white bg-clip-padding',
  // a checkerboard behind the swatches shows through translucent colors
  'bg-[repeating-linear-gradient(-45deg,#ccc,#ccc_1px,#fff_1px,#fff_16px)]',
])

type SwatchProps = {
  tooltip: string
  color: string
}

const Swatch = ({ tooltip, color }: SwatchProps) => (
  <Tooltip
    content={tooltip}
    className="text-left leading-snug whitespace-pre-line"
    delayDuration={0}
  >
    <div className="flex-1" style={{ backgroundColor: color }} />
  </Tooltip>
)

/** One token's swatch: a theme pair splits into its light and dark half. */
const TokenSwatch = ({ name }: { name: string }) => {
  const value = TOKENS.get(name) ?? ''
  const pair = themeValues(value)
  const reference = value.startsWith('var(') ? `${value} → ` : ''

  if (!pair)
    return <Swatch tooltip={`${name}\n${reference}${resolve(value)}`} color={resolve(value)} />

  return (
    <>
      <Swatch tooltip={`${name} · light\n${pair[0]}`} color={pair[0]} />
      <Swatch tooltip={`${name} · dark\n${pair[1]}`} color={pair[1]} />
    </>
  )
}

type HeaderProps = {
  title: string
  name: string
  note?: string
}

const Header = ({ title, name, note }: HeaderProps) => (
  <div className="mb-2 text-sm text-foreground">
    <span className="font-bold">{title}</span>{' '}
    <code className="font-mono text-foreground/60">[{name}]</code>
    {note && <span className="ml-2 text-foreground/60">{note}</span>}
  </div>
)

const titleCase = (value: string) =>
  value.replace(
    /(^|-)([a-z])/g,
    (_, dash: string, letter: string) => `${dash ? ' ' : ''}${letter.toUpperCase()}`,
  )

type ColorFamilyProps = {
  family: string
}

/**
 * A family's default above a full-width strip of its shades. The default is drawn from what
 * `--color-<family>` actually holds, so a theme pair (as `--color-secondary` is) shows as one.
 */
const ColorFamily = ({ family }: ColorFamilyProps) => {
  const name = `--color-${family}`

  const shades = [...TOKENS.keys()]
    .filter((token) => SHADE.exec(token)?.[1] === family)
    .sort((a, b) => Number(SHADE.exec(a)?.[2]) - Number(SHADE.exec(b)?.[2]))

  const defaultValue = TOKENS.get(name)
  const isThemePair = defaultValue ? themeValues(defaultValue) !== null : false

  return (
    <div className="mb-8">
      <Header
        title={titleCase(family)}
        name={name}
        note={isThemePair ? 'default is a theme token, not a shade (light | dark)' : undefined}
      />
      <div className={cn(SWATCH_FRAME, 'flex-col')}>
        {defaultValue && (
          <div className="flex h-12 border-b border-border">
            <TokenSwatch name={name} />
          </div>
        )}
        <div className="flex h-12">
          {shades.map((shade) => (
            <TokenSwatch key={shade} name={shade} />
          ))}
        </div>
      </div>
    </div>
  )
}

const Palette = ({ children }: { children: ReactNode }) => (
  <TooltipProvider>
    <div className="flex flex-col leading-5">{children}</div>
  </TooltipProvider>
)

type ColorFamiliesProps = {
  /** Families to show, in this order; leave out to show every family not listed in `except`. */
  families?: string[]
  except?: string[]
}

/** Color families from `_colors.css`, each with its default and shades. */
export const ColorFamilies: FunctionComponent<ColorFamiliesProps> = ({ families, except = [] }) => (
  <Palette>
    {(families ?? FAMILIES.filter((family) => !except.includes(family))).map((family) => (
      <ColorFamily key={family} family={family} />
    ))}
  </Palette>
)

/** Every theme token (a `light-dark()` pair) from `_colors.css`, light half left, dark half right. */
export const ThemeTokens: FunctionComponent = () => {
  const names = [...TOKENS.entries()].flatMap(([name, value]) =>
    // every light-dark() token, including those with one value for both themes
    splitLightDark(value) === null ? [] : [name],
  )

  return (
    <Palette>
      <div className="grid gap-x-6 sm:grid-cols-2">
        {names.map((name) => (
          <div key={name} className="mb-6">
            <Header title={titleCase(name.replace('--color-', ''))} name={name} />
            <div className={cn(SWATCH_FRAME, 'h-10')}>
              <TokenSwatch name={name} />
            </div>
          </div>
        ))}
      </div>
    </Palette>
  )
}
