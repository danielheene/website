import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { normalizePhoneNumber } from '@/globals/SettingsGlobalUser/phoneNumber'
import { GlobalSlug } from '@/types/globals'
import type { GlobalUserSettings } from '@/types/payload'

type StoredSettings = Partial<GlobalUserSettings> & {
  telephone?: string | null
}

/**
 * The user settings' plain `telephone` text field became the `phoneNumber`
 * group. Its value moves to `phoneNumber.value`, normalized to E.164 the way
 * the field's `beforeValidate` hook stores it.
 *
 * Goes through the native driver: `telephone` is no longer in the Mongoose
 * schema, so strict mode would neither return nor unset it.
 */
export async function up({ payload, session }: MigrateUpArgs): Promise<void> {
  const globals = payload.db.globals.collection

  const filter = {
    globalType: GlobalSlug.GlobalUserSettings,
  }

  const settings = await globals.findOne<StoredSettings>(filter, { session })

  if (!settings?.telephone) return

  const value = settings.phoneNumber?.value || normalizePhoneNumber(settings.telephone, settings)

  await globals.updateOne(
    filter,
    {
      $set: {
        'phoneNumber.value': value,
      },
      $unset: {
        telephone: '',
      },
    },
    { session },
  )

  payload.logger.info(`[migrate] ${GlobalSlug.GlobalUserSettings}: moved telephone to phoneNumber`)
}

export async function down({ payload, session }: MigrateDownArgs): Promise<void> {
  const globals = payload.db.globals.collection

  const filter = {
    globalType: GlobalSlug.GlobalUserSettings,
  }

  const settings = await globals.findOne<StoredSettings>(filter, { session })
  const value = settings?.phoneNumber?.value

  if (!value) return

  await globals.updateOne(
    filter,
    {
      $set: {
        telephone: value,
      },
      $unset: {
        phoneNumber: '',
      },
    },
    { session },
  )
}
