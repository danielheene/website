'use client'

import { useNav } from '@payloadcms/ui'
import type React from 'react'

import { cn } from '@/lib/cn'

import './NavWrapper.styles.css'

interface NavWrapperProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}

export const NavWrapper = ({ children, header, footer }: NavWrapperProps) => {
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
        {header}
        <nav className="nav__scroller" ref={navRef}>
          {children}
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
