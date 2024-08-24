import React from 'react'

export const useOnResizeCallback = (
  onResizeCallback: (event?: UIEvent) => void,
  triggerInitial: boolean = false,
): void => {
  const callbackRef = React.useRef<Parameters<typeof useOnResizeCallback>[0]>(onResizeCallback)
  const triggered = React.useRef<Parameters<typeof useOnResizeCallback>[1]>(!triggerInitial)

  const callback = React.useCallback<Parameters<typeof useOnResizeCallback>[0]>((event) => {
    return callbackRef.current(event)
  }, [])

  React.useEffect(() => {
    if (!triggered.current) {
      triggered.current = true
      callback()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    window.addEventListener('resize', callback, false)
    window.addEventListener('orientationchange', callback, false)
    return () => {
      window.removeEventListener('resize', callback, false)
      window.removeEventListener('orientationchange', callback, false)
    }
  }, [callback])
}
