import { AdminGroup, CollectionSlug } from '@custom-types'
import { hoursToSeconds, minutesToMilliseconds } from 'date-fns'
import type { CollectionConfig } from 'payload'

import { loginAfterCreate } from './hooks/loginAfterCreate'

export const Users: CollectionConfig = {
  slug: CollectionSlug.Users,

  admin: {
    custom: {
      icon: 'user',
    },
    useAsTitle: 'email',
    disableCopyToLocale: true,
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
      relationTo: CollectionSlug.MediaImages,
    },
  ],
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
