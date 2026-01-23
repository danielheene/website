import { AdminGroup, CollectionSlug } from '@custom-types'
import { hoursToSeconds, minutesToMilliseconds } from 'date-fns'
import { CollectionConfig } from 'payload'

import { loginAfterCreate } from './hooks/loginAfterCreate'

export const Users: CollectionConfig = {
  slug: CollectionSlug.Users,

  admin: {
    custom: {
      icon: 'user',
    },
    useAsTitle: 'email',
    group: AdminGroup.General,
  },
  fields: [],
  hooks: {
    afterChange: [loginAfterCreate],
  },
  auth: {
    tokenExpiration: hoursToSeconds(24 * 14),
    maxLoginAttempts: 5,
    lockTime: minutesToMilliseconds(5),
  },
  timestamps: true,
  versions: false,
}
