import { createCommand, type LexicalCommand } from '@payloadcms/richtext-lexical/lexical'

/**
 * Dispatched with an Iconify name to insert an icon, or with `undefined` from
 * the toolbar to open the picker.
 *
 * Kept in its own module so the client feature can import the command without
 * pulling `IconNode.server` — and therefore a second class registered for the
 * `icon` type — into the browser bundle.
 */
export const INSERT_ICON_COMMAND: LexicalCommand<string | undefined> =
  createCommand('INSERT_ICON_COMMAND')
