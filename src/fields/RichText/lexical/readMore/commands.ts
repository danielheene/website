import { createCommand, type LexicalCommand } from '@payloadcms/richtext-lexical/lexical'

/**
 * Kept in its own module so the client feature can import the command
 * without pulling in `ReadMoreNode.server` — and therefore a second class
 * registered for the `readMore` type — alongside `ReadMoreNode.client` in
 * the browser bundle.
 */
export const INSERT_READ_MORE_COMMAND: LexicalCommand<undefined> = createCommand(
  'INSERT_READ_MORE_COMMAND',
)
