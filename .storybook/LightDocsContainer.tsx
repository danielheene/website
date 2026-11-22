import { useLayoutEffect } from 'react'

import { DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks'

import { applyDarkMode } from './toolbarGlobals'

/**
 * Docs pages read light, whatever the toolbar toggle says (story canvases on them get the theme
 * through `StoryCanvasTheme`). MDX-only pages run no story decorator, so without this <html> keeps
 * whatever class the last story left, or none: every `light-dark()` token needs one of the two.
 */
export const LightDocsContainer = (props: DocsContainerProps) => {
  useLayoutEffect(() => applyDarkMode(false), [])

  return <DocsContainer {...props} />
}
