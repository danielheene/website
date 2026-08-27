import type { FieldHook, TypeWithID } from 'payload'

/**
 * Makes `protected` unwritable through the application entirely.
 *
 * Create always stores `false`; update always writes back the stored value. An
 * incoming `protected` is therefore discarded no matter which API it arrived
 * through. The `access` rules only filter the REST/GraphQL surface — the Local
 * API bypasses field access, so the guarantee has to live here.
 *
 * Consequence: the flag can only be set out-of-band, by writing to the database
 * directly. That is deliberate — it is a guard against deleting a handful of
 * structural pages, not user-facing state.
 */
export const preserveProtected: FieldHook<TypeWithID, boolean> = ({ operation, previousValue }) => {
  if (operation === 'update') return previousValue ?? false
  return false
}
