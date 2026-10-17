import type { FunctionComponent, ReactNode } from 'react'

import { ResetWrapper } from 'storybook/internal/components'
import { cn } from 'tailwind-variants'

interface SpecimenItemProps {
  title: string
  subtitle?: string
  children?: ReactNode
  /** Tile box height. Defaults to a size comfortable for shapes; pass `lg` for content that needs
   * more room to read, like shaders or animated gradients. */
  size?: 'default' | 'lg'
}

/**
 * A single labeled example box — the shared cell used by the radii, aspect
 * ratio, shadow, animation, and shader foundation pages. Mirrors `ColorItem`'s
 * title/subtitle layout but renders arbitrary content instead of a swatch.
 */
export const SpecimenItem: FunctionComponent<SpecimenItemProps> = ({
  title,
  subtitle,
  children,
  size = 'default',
}) => (
  <div className="m-3.75 inline-flex min-w-56 flex-[0_1_calc(20%-30px)] flex-col items-center">
    <div
      className={cn(
        'rounded-md border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.10)] dark:shadow-[0_2px_5px_rgba(0,0,0,0.20)]',
        'flex w-full items-center justify-center overflow-hidden',
        size === 'lg' ? 'h-56' : 'h-40',
      )}
    >
      {children}
    </div>
    <div className="mt-[1em] text-center font-mono text-sm leading-[1.2] font-bold text-foreground">
      {title}
    </div>
    {subtitle && (
      <div className="text-center font-mono text-xs text-foreground/40 dark:text-foreground/60">
        {subtitle}
      </div>
    )}
  </div>
)

interface SpecimenGalleryProps {
  children?: ReactNode
}

/** Grid wrapper for `SpecimenItem`s, matching `IconGallery`'s layout. */
export const SpecimenGallery: FunctionComponent<SpecimenGalleryProps> = ({
  children,
  ...props
}) => (
  <ResetWrapper>
    <div {...props} className="docblock-specimengallery sb-unstyled flex flex-row flex-wrap">
      {children}
    </div>
  </ResetWrapper>
)
