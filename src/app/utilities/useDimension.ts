'use client'

import React from 'react'

type Dimensions = {
  width: number
  height: number
}

export const useDimensions = (ref: React.RefObject<HTMLElement> | HTMLElement): Dimensions => {
  const element = React.useRef<HTMLElement>(null)
  const [dimensions, setDimensions] = React.useState<Dimensions>({
    width: 0,
    height: 0,
  })

  const updateDimensions = React.useCallback(() => {
    const { offsetWidth: width, offsetHeight: height } = element.current
    setDimensions({ width, height })
  }, [])

  React.useEffect(() => {
    element.current = ref instanceof HTMLElement ? ref : ref.current

    if (element.current) {
      updateDimensions()
      window.addEventListener('resize', updateDimensions)
      window.addEventListener('orientationchange', updateDimensions)
      return () => {
        window.removeEventListener('resize', updateDimensions)
        window.removeEventListener('orientationchange', updateDimensions)
      }
    }
  }, [element, ref, updateDimensions])

  return dimensions
}
