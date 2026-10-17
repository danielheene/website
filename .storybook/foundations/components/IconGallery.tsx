import type { FunctionComponent, ReactNode } from 'react'

import { ResetWrapper } from 'storybook/internal/components'
import { cn } from 'tailwind-variants'

interface IconItemProps {
  name: string
  children?: ReactNode
}

/** An individual icon with a caption and an example (passed as `children`). */
export const IconItem: FunctionComponent<IconItemProps> = ({ name, children }) => (
  <div className="m-3.75 inline-flex min-w-30 flex-[0_1_calc(20%-50px)] flex-col items-center">
    {/* a button rather than a div with onClick: the tile is click-to-copy, so it
        needs to be keyboard-reachable and announced as an action */}
    <button
      type="button"
      aria-label={`Copy icon name "${name}" to clipboard`}
      className={cn(
        'rounded-md border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.10)] dark:shadow-[0_2px_5px_rgba(0,0,0,0.20)]',
        'flex size-[2em] flex-none items-center justify-center overflow-hidden text-[3rem] [&>img]:size-[1em] [&>svg]:size-[1em]',
      )}
      onClick={async () => {
        if (navigator) await navigator.clipboard.writeText(name)
      }}
    >
      {children}
    </button>
    <div className="mt-[1em] text-center font-mono text-sm leading-[1.2] font-bold text-foreground">
      {name}
    </div>
  </div>
)

interface IconGalleryProps {
  children?: ReactNode
}

/** Show a grid of icons, as specified by `IconItem`. */
export const IconGallery: FunctionComponent<IconGalleryProps> = ({ children, ...props }) => (
  <ResetWrapper>
    <div {...props} className="docblock-icongallery sb-unstyled flex flex-row flex-wrap">
      {children}
    </div>
  </ResetWrapper>
)
