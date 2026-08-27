'use client'

import { useNav } from '@payloadcms/ui'

import { get } from 'lodash-es'
import { cn } from 'tailwind-variants'

import { ResolvedRelations } from '@/lib/resolveRelation'
import { AdminNavigationGroup } from '@/types/admin-panel'
import { User } from '@/types/payload'

import { NavFooter } from './NavFooter'
import { NavGroup } from './NavGroup'
import { NavHeader } from './NavHeader'

interface NavClientProps {
  user: ResolvedRelations<User>
  navigationConfig: AdminNavigationGroup[]
}

export const NavClient = ({ navigationConfig, user }: NavClientProps) => {
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

        <NavFooter
          avatarSrc={get(user, 'avatar.value.url', '')}
          email={user.email}
          name={user.name || ''}
        />
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
