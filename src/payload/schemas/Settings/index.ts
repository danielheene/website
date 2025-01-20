import { Navigation } from './Navigation'
import { Meta } from './Meta'
import { createSchemaGroup } from '@/payload/utilities/schemaHelpers'

export const Settings = createSchemaGroup('settings', [Navigation, Meta])
