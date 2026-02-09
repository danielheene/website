'use client'

import { cn } from '@/utilities/cn'
import { useNav } from '@payloadcms/ui'
import React from 'react'

import './NavWrapper.styles.scss'

interface NavWrapperProps {
  children: React.ReactNode
}

export const NavWrapper = ({ children }: NavWrapperProps) => {
  const { hydrated, navOpen, navRef, shouldAnimate, setNavOpen } = useNav()

  return (
    <aside className={cn(['nav', navOpen && 'nav--open', shouldAnimate && 'nav--animate', hydrated && 'nav--hydrated'])}>
      <div className="nav__scroller" ref={navRef}>
        <nav className="nav__wrap">{children}</nav>
      </div>
      <button className="nav__rail" role="button" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle navigation" />
    </aside>
  )
}
