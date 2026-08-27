import { AdminNavigationEntry } from '@/types/admin-panel'

import { NavLink } from '../NavLink'
import './NavGroup.styles.css'
import { cn } from 'tailwind-variants'

export type NavGroupProps = {
  label: string | false
  entries: AdminNavigationEntry[]
  className?: string
}

export const NavGroup = ({ label, entries, className = '' }: NavGroupProps) => (
  <section className={cn('nav-group', className)}>
    {label && <header className="nav-group__label">{label}</header>}
    <div className="nav-group__items">
      {entries.map((entry) => (
        <NavLink key={entry.slug} {...entry} />
      ))}
    </div>
  </section>
)
