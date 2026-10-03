'use client'

import { useBlockComponentContext } from '@payloadcms/richtext-lexical/client'
import { useLexicalEditable } from '@payloadcms/richtext-lexical/lexical/react/useLexicalEditable'
import { RenderFields } from '@payloadcms/ui'

import { cn } from 'tailwind-variants'

/**
 * Editor view of the Two-Column block: the two column editors sit directly in
 * the surrounding rich text, without the collapsible header Payload wraps
 * blocks in. Rendered inside the block's own form, so the fields edit the
 * block's data exactly as the default view does.
 *
 * The only chrome left is the remove button, shown on hover; the edit drawer
 * would only repeat the same two editors.
 */
export const ColumnsBlock = () => {
  const { formSchema, RemoveButton } = useBlockComponentContext()
  const isEditable = useLexicalEditable()

  return (
    <div
      className={cn([
        'group/columns relative my-2',
        // The row already stretches both column fields to the taller one; let
        // every level of each editor grow into that height, so the columns
        // line up and either one can be clicked anywhere to start typing.
        String.raw`[&_.rich-text-lexical\_\_wrap]:grow`,
        String.raw`[&_.editor-container]:flex [&_.editor-container]:flex-col`,
        String.raw`[&_.editor-scroller]:flex [&_.editor-scroller]:grow [&_.editor-scroller]:flex-col`,
        String.raw`[&_.editor]:flex [&_.editor]:grow [&_.editor]:flex-col`,
        String.raw`[&_.ContentEditable\_\_root]:grow`,
        // A lower floor than the full-width editor's 500px.
        String.raw`[&_.ContentEditable\_\_root]:min-h-37.5!`,
      ])}
    >
      {isEditable && (
        <div
          className={cn([
            'absolute -top-3 right-2 z-10 transition-opacity',
            // Hidden means unclickable too, so a stray click near the block
            // above can't delete this one.
            'pointer-events-none opacity-0',
            'group-hover/columns:pointer-events-auto group-hover/columns:opacity-100',
            'group-focus-within/columns:pointer-events-auto group-focus-within/columns:opacity-100',
          ])}
        >
          <RemoveButton />
        </div>
      )}
      <RenderFields
        fields={formSchema}
        forceRender
        parentIndexPath=""
        parentPath=""
        parentSchemaPath=""
        permissions
        readOnly={!isEditable}
      />
    </div>
  )
}
