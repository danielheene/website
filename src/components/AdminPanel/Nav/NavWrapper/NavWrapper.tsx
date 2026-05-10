'use client'

import { useNav } from '@payloadcms/ui'
import type React from 'react'

import { cn } from '@/lib/cn'

import './NavWrapper.styles.css'

interface NavWrapperProps {
  children: React.ReactNode
}

export const NavWrapper = ({ children }: NavWrapperProps) => {
  const { hydrated, navOpen, navRef, shouldAnimate, setNavOpen } = useNav()
  return (
    <aside
      className={cn(['nav', navOpen && 'nav--open', shouldAnimate && 'nav--animate', hydrated && 'nav--hydrated'])}>
      <div className="nav__scroller" ref={navRef}>
        <nav className="nav__wrap">{children}</nav>
      </div>
      <button type="button" className="nav__rail" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle navigation" />
    </aside>
  )
}
