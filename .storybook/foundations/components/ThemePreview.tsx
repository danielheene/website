import { useState, type FC } from 'react'

import { cn } from 'tailwind-variants'

import { TooltipProvider } from '@/components/AdminPanel/TooltipProvider'
import { Button } from '@/components/Button'
import { Tooltip } from '@/components/Tooltip'

type Theme = 'light' | 'dark'

// class names written out so Tailwind sees them
const TOKENS = [
  { name: 'background', className: 'bg-background' },
  { name: 'foreground', className: 'bg-foreground' },
  { name: 'card', className: 'bg-card' },
  { name: 'popover', className: 'bg-popover' },
  { name: 'primary', className: 'bg-primary' },
  { name: 'secondary', className: 'bg-secondary' },
  { name: 'muted', className: 'bg-muted' },
  { name: 'accent', className: 'bg-accent' },
  { name: 'destructive', className: 'bg-destructive' },
  { name: 'border', className: 'bg-border' },
  { name: 'input', className: 'bg-input' },
  { name: 'ring', className: 'bg-ring' },
] as const

type TokenSwatchProps = (typeof TOKENS)[number]

const TokenSwatch = ({ name, className }: TokenSwatchProps) => {
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const [value, setValue] = useState('')

  return (
    <Tooltip
      content={`--color-${name}\n${value}`}
      className="text-left leading-snug whitespace-pre-line"
      delayDuration={0}
      // the tokens are light-dark() pairs, so the value depends on the card's theme
      onOpenChange={(open) => {
        if (open && element) setValue(getComputedStyle(element).backgroundColor)
      }}
    >
      <div className="flex flex-col gap-1.5">
        <div ref={setElement} className={cn('h-10 rounded-md border border-border', className)} />
        <span className="truncate font-mono text-xs text-muted-foreground">{name}</span>
      </div>
    </Tooltip>
  )
}

type ThemeCardProps = {
  theme: Theme
}

/**
 * One theme, applied to the card alone: the `light`/`dark` class sets `color-scheme`, which picks
 * the side of every `light-dark()` token, whatever the page or the toolbar toggle use.
 */
const ThemeCard = ({ theme }: ThemeCardProps) => (
  <section
    className={cn(
      theme,
      'flex flex-col gap-6 rounded-lg border border-border bg-background p-6 text-foreground',
    )}
  >
    <header className="flex items-baseline justify-between">
      <h3 className="font-mono text-lg font-bold capitalize">{theme}</h3>
      <code className="font-mono text-xs text-muted-foreground">.{theme}</code>
    </header>

    <div className="flex flex-col gap-2">
      <p className="font-mono text-2xl font-bold">Heavy boxes perform quick waltzes.</p>
      <p className="text-base">
        Body text on the background, with a <span className="text-primary underline">link</span> in
        it.
      </p>
      <p className="text-sm text-muted-foreground">
        Muted text for captions and secondary details.
      </p>
    </div>

    <div className="flex flex-col gap-1 rounded-md border border-border bg-card p-4 text-card-foreground">
      <span className="font-bold">Card</span>
      <span className="text-sm text-muted-foreground">Surfaces sit on the background.</span>
    </div>

    <div className="flex flex-wrap gap-2">
      <Button size="sm">Default</Button>
      <Button size="sm" variant="secondary">
        Secondary
      </Button>
      <Button size="sm" variant="outline">
        Outline
      </Button>
      <Button size="sm" variant="ghost">
        Ghost
      </Button>
      <Button size="sm" variant="destructive">
        Destructive
      </Button>
    </div>

    <div className="grid grid-cols-4 gap-3">
      {TOKENS.map((token) => (
        <TokenSwatch key={token.name} {...token} />
      ))}
    </div>
  </section>
)

/** The light and dark theme side by side, independent of the Storybook theme toggle. */
export const ThemePreview: FC = () => (
  <TooltipProvider>
    <div className="my-6 grid gap-6 md:grid-cols-2">
      <ThemeCard theme="light" />
      <ThemeCard theme="dark" />
    </div>
  </TooltipProvider>
)
