import { AdminGroup } from '@custom-types'
import { NavGroupType } from '@payloadcms/ui/utilities/groupNavItems'
import { JSX } from 'react'
import { NavLink } from '../NavLink'

import './NavGroup.styles.scss'

export type NavGroupProps = Omit<NavGroupType, 'label'> & Partial<Pick<NavGroupType, 'label'>>

export const NavGroup = ({ label, entities = [] }: NavGroupProps): JSX.Element => {
  const renderedLabel = label.toLowerCase() === AdminGroup.General.toLowerCase() ? null : label

  return (
    <section className="nav-group" {...(renderedLabel ? { 'aria-labelledby': 'nav-group__label' } : {})}>
      {renderedLabel && <header className="nav-group__label">{renderedLabel}</header>}
      <div className="nav-group__items">
        {entities.map(({ slug, type, label }, index) => (
          <NavLink key={index} slug={slug} type={type} label={label} />
        ))}
      </div>
    </section>
  )
}
