'use client'

import type React from 'react'
import { useNav } from '@payloadcms/ui'

import { AdminNavigationGroup } from '@website/types/admin-panel'
import { cn } from 'tailwind-variants'

import { NavGroup } from './NavGroup'
import { NavHeader } from './NavHeader'

interface NavClientProps {
  navigationConfig: AdminNavigationGroup[]
  /**
   * Render the user-dependent footer slot
   *
   * Passed as a node so `Nav.tsx` can wrap only the user-resolving part in
   * `Suspense`; the nav shell and its grid column render immediately.
   */
  footer: React.ReactNode
}

export const NavClient = ({ navigationConfig, footer }: NavClientProps) => {
  const { hydrated, navOpen, navRef, shouldAnimate, setNavOpen } = useNav()

  return (
    <aside
      className={cn([
        'nav',
        navOpen && 'nav--open',
        shouldAnimate && 'nav--animate',
        hydrated && 'nav--hydrated',
      ])}
    >
      <div className="nav__content">
        <NavHeader />

        <nav className="nav__scroller" ref={navRef}>
          {navigationConfig.map((navGroup, index) => (
            <NavGroup key={index} {...navGroup} />
          ))}
        </nav>

        {footer}
      </div>
      <button
        type="button"
        className="nav__rail"
        onClick={() => setNavOpen(!navOpen)}
        aria-label="Toggle navigation"
      />
    </aside>
  )
}
