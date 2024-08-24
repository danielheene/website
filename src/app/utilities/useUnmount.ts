import React, { useEffect } from 'react'

export const useUnmount = (fn: () => void) => {
  const fnRef = React.useRef(fn)
  fnRef.current = fn

  useEffect(() => () => fnRef.current(), [])
}
