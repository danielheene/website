import React, { useState } from 'react'

const focusableSelector = (() =>
  [
    'a[href]:not([tabindex^="-"])',
    'area[href]:not([tabindex^="-"])',
    'input:not([type="hidden"]):not([type="radio"]):not([disabled]):not([tabindex^="-"])',
    'input[type="radio"]:not([disabled]):not([tabindex^="-"])',
    'select:not([disabled]):not([tabindex^="-"])',
    'textarea:not([disabled]):not([tabindex^="-"])',
    'button:not([disabled]):not([tabindex^="-"])',
    'iframe:not([tabindex^="-"])',
    'audio[controls]:not([tabindex^="-"])',
    'video[controls]:not([tabindex^="-"])',
    '[contenteditable]:not([tabindex^="-"])',
    '[tabindex]:not([tabindex^="-"])',
  ].join(','))()

export const useFocusTrap = (
  ref: React.Ref<Element>,
  {
    restoreOnExit = false,
  }: {
    restoreOnExit: boolean
  },
): [boolean, (n: boolean) => void] => {
  const [isActive, setIsActive] = useState<boolean>(false)
  const rootRef = React.useRef<HTMLElement>(null)
  const restoreRef = React.useRef<HTMLElement>(null)
  const focusedRef = React.useRef<HTMLElement>(null)

  const focusElement = React.useCallback((element: Element | HTMLElement) => {
    const interval: NodeJS.Timer | number = setInterval(() => {
      if (document.activeElement === element) {
        focusedRef.current = element as HTMLElement
        clearInterval(interval)
      } else if ('focus' in element) {
        element.focus()
      }
    }, 25)
  }, [])

  const handleFocus = React.useCallback(
    (event: KeyboardEvent) => {
      if (!rootRef.current || !focusedRef.current || event.key !== 'Tab') return

      event.preventDefault()
      const elements = rootRef.current.querySelectorAll(focusableSelector)
      const currentPosition = Array.from(elements).indexOf(focusedRef.current)
      const nextPosition =
        (currentPosition + (event.shiftKey ? elements.length - 1 : 1)) % elements.length
      const nextFocus = elements[nextPosition] as HTMLElement
      focusElement(nextFocus)
    },
    [focusElement],
  )

  /* run this hook only on mount to cache last focused element */
  React.useEffect(() => {
    if (restoreOnExit && !restoreRef.current) {
      restoreRef.current = document.activeElement as HTMLElement
    }

    return () => {
      if (restoreOnExit && restoreRef.current instanceof HTMLElement) {
        restoreRef.current.focus()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* run this hook only once to determine the first focusable element */
  React.useEffect(() => {
    if (rootRef.current && !focusedRef.current) {
      const [firstElement] = rootRef.current.querySelectorAll(focusableSelector)
      if (firstElement) focusElement(firstElement)
    }
  }, [focusElement])

  React.useEffect(() => {
    window?.addEventListener('keydown', handleFocus, false)
    return () => {
      window?.removeEventListener('keydown', handleFocus, false)
    }
  }, [handleFocus])

  return [isActive, setIsActive]
}
