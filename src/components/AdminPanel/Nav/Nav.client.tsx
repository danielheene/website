'use client'

import type React from 'react'
import { useNav } from '@payloadcms/ui'

import { cn } from 'tailwind-variants'

import { AdminNavigationGroup } from '@/types/admin-panel'

import { NavGroup } from './NavGroup'
import { NavHeader } from './NavHeader'

interface NavClientProps {
  navigationConfig: AdminNavigationGroup[]
  // The nav footer depends on the resolved user (avatar/email/name), fetched
  // server-side; passed as children so `Nav.tsx` can wrap just that part in
  // `Suspense` while this shell (and the grid column it occupies) renders
  // immediately.
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
