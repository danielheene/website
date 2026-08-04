'use client'

import './NavHeader.styles.css'

import { useNav } from '@payloadcms/ui'

import { Logo } from '@repo/ui/Logo'

import { useIsMobile } from '@/hooks/use-mobile'

export const NavHeader = () => {
  const { navOpen } = useNav()
  const isMobile = useIsMobile()

  return (
    <header className="nav-header">
      <Logo
        color="white"
        className="nav-header__logo"
        variant={!isMobile && !navOpen ? 'initials' : 'inline'}
      />
    </header>
  )
}
