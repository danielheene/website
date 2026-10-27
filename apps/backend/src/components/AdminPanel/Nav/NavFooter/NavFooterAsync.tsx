import type { ServerProps } from 'payload'

import { get } from 'lodash-es'

import { resolveRelations } from '@/lib/resolveRelation'

import { NavFooter } from './NavFooter'

type NavFooterAsyncProps = Pick<ServerProps, 'user'>

export const NavFooterAsync = async ({ user: userFromProps }: NavFooterAsyncProps) => {
  const user = await resolveRelations(userFromProps)

  return (
    <NavFooter
      avatarSrc={get(user, 'avatar.value.url', '')}
      email={user.email}
      name={user.name || ''}
      enableOwnTracking={Boolean(user.enableOwnTracking)}
      userId={user.id}
    />
  )
}
