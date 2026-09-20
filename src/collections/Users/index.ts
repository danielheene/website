import type { CollectionConfig } from 'payload'

import { hoursToSeconds, minutesToMilliseconds } from 'date-fns'

import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

import { loginAfterCreate } from './hooks/loginAfterCreate'

// The create-first-user view renders every collection field regardless of admin.hidden
// (it calls buildFormState with renderAllFields: true), so hiding fields there requires
// admin.condition instead, keyed off the absence of a logged-in user (create-first-user
// runs with no req.user, unlike a normal authenticated create/edit).
const showUnlessCreatingFirstUser: NonNullable<
  CollectionConfig['fields'][number]['admin']
>['condition'] = (_data, _siblingData, { user }) => Boolean(user)

export const Users: CollectionConfig = {
  slug: CollectionSlug.Users,

  admin: {
    custom: {
      icon: 'user',
    },
    useAsTitle: 'email',
    group: AdminGroup.Settings,
  },
  fields: [
    {
      type: 'text',
      name: 'name',
      admin: {
        condition: showUnlessCreatingFirstUser,
      },
    },
    {
      type: 'upload',
      name: 'avatar',
      relationTo: [
        CollectionSlug.MediaImages,
      ],
      admin: {
        condition: showUnlessCreatingFirstUser,
      },
    },
    {
      type: 'checkbox',
      name: 'enableOwnTracking',
      label: 'Track my own visits (debug)',
      defaultValue: false,
      saveToJWT: true,
      admin: {
        description:
          "When enabled, your own visits will be tracked in analytics like any other visitor. Off by default so your admin browsing doesn't skew site statistics.",
        condition: showUnlessCreatingFirstUser,
      },
    },
  ],
  hooks: {
    afterChange: [
      loginAfterCreate,
    ],
  },
  auth: {
    tokenExpiration: hoursToSeconds(24 * 14),
    maxLoginAttempts: 5,
    lockTime: minutesToMilliseconds(5),
  },
  timestamps: true,
  versions: false,
}
