import { sortNavGroups } from '@/payload/utilities/sortAdminGroups'
import { NavGroupType } from '@payloadcms/ui/utilities/groupNavItems'
import { AdminViewServerProps, ServerProps } from 'payload'
import { FC, Fragment } from 'react'
import { Merge } from 'type-fest'
import { DashboardGroup } from './DashboardGroup'

interface DashboardProps extends Merge<AdminViewServerProps, ServerProps> {
  navGroups: NavGroupType[]
}

export const Dashboard: FC<DashboardProps> = (props) => {
  const {
    navGroups,
    payload,
    payload: {
      config: {
        routes: { admin: adminRoute },
      },
    },
  } = props

  const sortedNavGroups = sortNavGroups(navGroups)

  console.log(JSON.stringify(navGroups, null, 2))
  return (
    <Fragment>
      {/*<DashboardBanner />*/}
      <div className="dashboard">
        <div className="dashboard__wrap">
          {sortedNavGroups.map(({ label, entities }, entityIndex) => (
            <DashboardGroup key={entityIndex} groupLabel={label} entities={entities} adminRoute={adminRoute} payload={payload} />
          ))}
        </div>
      </div>
    </Fragment>
  )
}
