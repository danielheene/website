import * as duration from 'duration-fns'
import { loginAfterCreate } from './hooks/loginAfterCreate'
import { seedAfterLogin } from './hooks/seedAfterLogin'
import { createCollection } from '@/payload/utilities/schemaHelpers'

export const Users = createCollection({
  slug: 'users',
  admin: {
    group: 'general',
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
  hooks: {
    afterChange: [loginAfterCreate],
    afterLogin: [seedAfterLogin],
  },
  auth: {
    tokenExpiration: duration.toSeconds({ days: 7 }),
    maxLoginAttempts: 5,
    lockTime: duration.toMilliseconds({ minutes: 5 }),
  },
  timestamps: true,
  versions: false,
})
