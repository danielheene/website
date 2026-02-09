import { NavGroupType } from '@payloadcms/ui/utilities/groupNavItems'
import { JSX } from 'react'
import { NavLink } from '../NavLink'

import './NavGroup.styles.scss'

export type NavGroupProps = Omit<NavGroupType, 'label'> & Partial<Pick<NavGroupType, 'label'>>

export const NavGroup = ({ label, entities = [] }: NavGroupProps): JSX.Element => {
  return (
    <section className="nav-group" aria-labelledby="nav-label">
      {label && <header className="nav-group__label">{label}</header>}
      <div className="nav-group__items">
        {entities.map(({ slug, type, label }, index) => (
          <NavLink key={index} slug={slug} type={type} label={label} />
        ))}
      </div>
    </section>
  )
}
