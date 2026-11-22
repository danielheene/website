import { useLayoutEffect, useRef, type ReactNode } from 'react'

const CANVAS_CLASSES = ['bg-background', 'text-foreground']

type StoryCanvasThemeProps = {
  isDark: boolean
  children: ReactNode
}

/**
 * Docs pages render stories inline, so the theme goes on each story's preview
 * box (`.docs-story`) instead of <html>: the canvas switches, the docs text
 * around it keeps Storybook's own theme.
 */
export const StoryCanvasTheme = ({ isDark, children }: StoryCanvasThemeProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const canvas = ref.current?.closest('.docs-story')

    if (!canvas) return

    canvas.classList.add(...CANVAS_CLASSES)
    canvas.classList.toggle('dark', isDark)
  }, [isDark])

  return <div ref={ref}>{children}</div>
}
