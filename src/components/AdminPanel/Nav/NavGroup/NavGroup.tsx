import { AdminNavigationEntry } from '@/types/admin-panel'

import { NavLink } from '../NavLink'
import './NavGroup.styles.css'

export type NavGroupProps = {
  label: string | false
  entries: AdminNavigationEntry[]
}

export const NavGroup = ({ label, entries }: NavGroupProps) => {
  return (
    <section className="nav-group">
      {label && <header className="nav-group__label">{label}</header>}
      <div className="nav-group__items">
        {entries.map((entry) => (
          <NavLink key={entry.slug} {...entry} />
        ))}
      </div>
    </section>
  )
}
