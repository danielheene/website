import type { CollectionConfig } from 'payload'

import { hoursToSeconds, minutesToMilliseconds } from 'date-fns'

import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

import { loginAfterCreate } from './hooks/loginAfterCreate'

export const Users: CollectionConfig = {
  slug: CollectionSlug['Users'],

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
    },
    {
      type: 'upload',
      name: 'avatar',
      relationTo: [
        CollectionSlug['MediaImages'],
      ],
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
