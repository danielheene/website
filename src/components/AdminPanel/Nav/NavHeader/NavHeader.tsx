'use client'

import { useIsMobile } from '@/hooks/use-mobile'
import { useNav } from '@payloadcms/ui'
import './NavHeader.styles.scss'

export const NavHeader = () => {
  const { navOpen } = useNav()
  const isMobile = useIsMobile()

  return <div className="nav-header">{/*<Logo className={styles.Logo} variant={!isMobile && !navOpen ? 'square' : 'inline'} />*/}</div>
}
