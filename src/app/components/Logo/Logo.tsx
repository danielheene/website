'use client'

import React, { JSX, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  LOGO_COLOR,
  LOGO_COLOR_VALUES,
  LOGO_SIZE,
  LOGO_SIZE_VALUES,
  LOGO_VARIANT,
  LOGO_VARIANT_VALUES,
  LogoColor,
  LogoSize,
  LogoVariant,
} from '@/components/Logo/Logo.data'
import { cn } from '@/utilities/cn'

interface LogoProps {
  color?: LogoColor
  variant?: LogoVariant
  size?: LogoSize
  animated?: boolean
  className?: string
}

export const Logo = (props: LogoProps): JSX.Element => {
  const {
    color = LOGO_COLOR.BRAND,
    variant = LOGO_VARIANT.SINGLELINE,
    size = LOGO_SIZE.REGULAR,
    animated = false,
    className,
  } = props

  const frameRef: RefObject<number> = useRef<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prevProps: RefObject<LogoProps> = useRef<LogoProps>(null)
  const [fontLoaded, setFontLoaded] = useState<boolean>(false)

  useEffect(() => {
    if (JSON.stringify(props) !== JSON.stringify(prevProps.current)) {
      prevProps.current = props
    }
  }, [props])

  const { rgbValue, fontSize, logoText } = useMemo(() => {
    return {
      rgbValue: LOGO_COLOR_VALUES[color],
      fontSize: LOGO_SIZE_VALUES[size],
      logoText: LOGO_VARIANT_VALUES[variant],
    }
  }, [color, size, variant])

  /**
   * make sure that “PP Supply Mono” is loaded before the logo is displayed
   */
  useEffect(() => {
    if (fontLoaded) return

    const font = new FontFace(
      'PP Supply Mono',
      'url(/fonts/pp-supply-mono/pp-supply-mono-400.woff2)',
      {
        style: 'normal',
        weight: '400',
        display: 'swap',
      },
    )

    font.load().then((f) => {
      document.fonts.add(f)
      setFontLoaded(true)
    })
  }, [fontLoaded])

  /**
   * draw function which calculates the representation of the logo
   * and renders the canvas element accordingly
   */
  const drawCanvas = useCallback(
    (time: number = 1): void => {
      if (!canvasRef.current || !canvasRef.current.getContext || !fontLoaded) return

      let alphaValue = 1
      const ctx = canvasRef.current.getContext('2d')

      const applyFontStyles = (ctx: CanvasRenderingContext2D): void => {
        ctx.font = `${fontSize}px "PP Supply Mono"`
        ctx.fillStyle = `rgb(${rgbValue} / ${alphaValue})`
        ctx.letterSpacing = '-0.125em'
      }

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      applyFontStyles(ctx)
      ctx.save()

      /**
       * calculate the widest line width including the width of an additional
       * letter as spacing for rendering the cursor underscore
       */
      ctx.canvas.width = logoText.reduce((prev, curr, i, array) => {
        ctx.restore()
        const appendix = i === array.length - 1 ? 'e' : ''
        const { width, actualBoundingBoxLeft } = ctx.measureText(curr + appendix)
        const measure = width + 2 * Math.abs(actualBoundingBoxLeft)
        return measure > prev ? measure : prev
      }, 0)

      /*
       * subtract top and bottom bounding if last line - otherwise only subtract
       * bounding on one edge to enable a small spacing between multiple lines
       */
      ctx.canvas.height = logoText.reduce((prev, curr, i, array) => {
        ctx.restore()
        const { actualBoundingBoxAscent: boundingSize } = ctx.measureText(curr)
        console.log(boundingSize)
        const boundingEdges = i < array.length - 1 ? 1 : 2
        return prev + (fontSize - Math.abs(Math.floor(boundingSize) * boundingEdges))
      }, 0)

      let boundingBoxOffset: number
      logoText.forEach((logoLine, index, array) => {
        ctx.restore()
        const { actualBoundingBoxAscent } = ctx.measureText(logoLine)
        boundingBoxOffset = boundingBoxOffset || actualBoundingBoxAscent

        const prevLinesHeight = index * (fontSize - Math.abs(boundingBoxOffset))
        const currentLineStart = fontSize - Math.abs(boundingBoxOffset * 2)

        applyFontStyles(ctx)
        ctx.fillText(logoLine, 0, prevLinesHeight + currentLineStart)

        /*
         * when loop has reached its last line append the cursor to its end
         * if animation is activated calculate opacity to display a blinking effect
         */
        if (index === array.length - 1) {
          ctx.restore()
          const { width: textWidth } = ctx.measureText(logoLine)
          const { actualBoundingBoxLeft: letterOffset, actualBoundingBoxRight: letterWidth } =
            ctx.measureText('e')
          const { actualBoundingBoxDescent: cursorHeight } = ctx.measureText('_')

          // applyFontStyles() will render the following alphaValue
          alphaValue = time % 1000 < 500 ? 1 : 0
          applyFontStyles(ctx)

          ctx.fillText(
            '_',
            textWidth + Math.abs(letterOffset),
            prevLinesHeight + currentLineStart - Math.abs(cursorHeight),
            letterWidth - 2 * Math.abs(letterOffset),
          )
        }
      })
    },
    [fontLoaded, fontSize, logoText, rgbValue],
  )

  const animate = useCallback(
    (time: number) => {
      const animationTime = Math.round(time * 100) / 100
      drawCanvas(animationTime)
      frameRef.current = requestAnimationFrame(animate)
    },
    [drawCanvas],
  )

  useEffect(() => {
    if (animated) {
      frameRef.current = requestAnimationFrame(animate)
    }

    if (!animated && frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      drawCanvas()
    }

    if (!animated && !frameRef.current) {
      drawCanvas()
    }

    return () => cancelAnimationFrame(frameRef.current)
  }, [fontLoaded, animated, fontSize, rgbValue, logoText, fontSize]) // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas className={cn(className)} ref={canvasRef} />
}
