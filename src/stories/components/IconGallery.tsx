import type { FunctionComponent, ReactNode } from 'react'

import { ResetWrapper } from 'storybook/internal/components'

import { cn } from '@/lib/cn'

interface IconItemProps {
  name: string
  children?: ReactNode
}

/** An individual icon with a caption and an example (passed as `children`). */
export const IconItem: FunctionComponent<IconItemProps> = ({ name, children }) => (
  <div className="inline-flex flex-col items-center flex-[0_1_calc(20%-50px)] min-w-30 m-3.75">
    <div
      className={cn(
        'rounded-md border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.10)] dark:shadow-[0_2px_5px_rgba(0,0,0,0.20)]',
        'overflow-hidden text-[3rem] h-[2em] w-[2em] flex items-center justify-center flex-none [&>img]:w-[1em] [&>img]:h-[1em] [&>svg]:w-[1em] [&>svg]:h-[1em]',
      )}
      onClick={async () => {
        if (navigator) await navigator.clipboard.writeText(name)
      }}
    >
      {children}
    </div>
    <div className="font-mono text-sm font-bold text-foreground mt-[1em] leading-[1.2] text-center">
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
