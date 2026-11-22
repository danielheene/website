'use client'

import { type ComponentPropsWithoutRef, forwardRef, type JSX } from 'react'

import { addAPIProvider, Icon as IconifyIconComponent } from '@iconify/react'

import { ICON, type IconName } from './aliases'
import { ICONIFY_API } from './api'

/**
 * Re-exported so existing `@/components/Icon` imports keep working. The value
 * lives in `./api` because this module is `'use client'` — see the note there.
 */
export { ICONIFY_API }

export { BRAND_ICON, ICON, UI_ICON, type IconName } from './aliases'

addAPIProvider('', {
  resources: [ICONIFY_API],
})

export type IconProps = Omit<
  ComponentPropsWithoutRef<typeof IconifyIconComponent>,
  'icon' | 'width' | 'height' | 'size' | 'name'
> & {
  name: IconName | string
}

/** The `data-*` and `aria-*` props, which Iconify forwards onto its rendered `<svg>`. */
const pickDomAttributes = (props: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(props).filter(([key]) => key.startsWith('data-') || key.startsWith('aria-')),
  )

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, className, style, ...iconBaseProps }, ref): JSX.Element => {
    const icon = ICON[name] ?? name

    return (
      <IconifyIconComponent
        ref={ref}
        icon={icon}
        className={className}
        style={style}
        // Icon data loads from the API after hydration; until then Iconify
        // renders an empty span, and the icon pushes its surroundings aside
        // when it arrives (layout shift). The placeholder is the same empty
        // 1em <svg> Iconify renders once loaded, with the same classes and
        // data/aria attributes, so parent selectors such as Button's
        // `[&>svg]` sizing and `has-data-[icon=…]` padding match it too.
        fallback={
          <svg
            aria-hidden="true"
            width="1em"
            height="1em"
            className={className}
            style={style}
            {...pickDomAttributes(iconBaseProps)}
          />
        }
        {...iconBaseProps}
      />
    )
  },
)
