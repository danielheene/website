import type { NavGroupType } from '@payloadcms/ui/utilities/groupNavItems'
import { getClient } from '@umami/api-client'
import { subWeeks } from 'date-fns'
import type { AdminViewServerProps, ServerProps } from 'payload'
import { type FC, Fragment } from 'react'
import type { Merge } from 'type-fest'

import { DashboardBanner } from '@/payload/components/Dashboard/DashboardBanner'

const client = getClient()

interface DashboardProps extends Merge<AdminViewServerProps, ServerProps> {
  navGroups: NavGroupType[]
}

export const Dashboard: FC<DashboardProps> = async (props) => {
  await (async () => {
    const { ok, data, status, error } = await client.getWebsiteStats('018a28eb-9ee8-4f43-851d-7ccc285f0aba', {
      startAt: subWeeks(new Date(), 2).getTime(),
      endAt: Date.now(),
    })
    console.log(ok, data, status, error)
  })()

  await (async () => {
    const { ok, data, status, error } = await client.getWebsiteMetrics('018a28eb-9ee8-4f43-851d-7ccc285f0aba', {
      startAt: subWeeks(new Date(), 2).getTime(),
      endAt: Date.now(),

      type: 'pageviews',
    })
    console.log(ok, data, status, error)
  })()

  const {
    navGroups,
    payload,
    payload: {
      config: {
        routes: { admin: adminRoute },
      },
    },
  } = props

  // const sortedNavGroups = sortNavGroups(navGroups)

  return (
    <Fragment>
      <DashboardBanner />
      {/*<div className="dashboard">*/}
      {/*  <div className="dashboard__wrap">*/}
      {/*    {navGroups.map(({ label, entities }, entityIndex) => (*/}
      {/*      <DashboardGroup key={entityIndex} groupLabel={label} entities={entities} adminRoute={adminRoute} payload={payload} />*/}
      {/*    ))}*/}
      {/*  </div>*/}
      {/*</div>*/}
    </Fragment>
  )
}
