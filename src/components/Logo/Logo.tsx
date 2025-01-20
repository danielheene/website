import React, { JSX, SVGAttributes, useMemo } from 'react'
import { cn } from '@/utilities/cn'

const LOGO_COLOR = {
  PRIMARY: 'primary',
  WHITE: 'white',
  BLACK: 'black',
  CURRENT: 'current',
} as const

const LOGO_VARIANT = {
  SINGLELINE: 'singleline',
  MULTILINE: 'multiline',
  SQUARE: 'square',
  SQUARE_CUT: 'square-cut',
} as const

export type LogoColor = (typeof LOGO_COLOR)[keyof typeof LOGO_COLOR]

export type LogoVariant = (typeof LOGO_VARIANT)[keyof typeof LOGO_VARIANT]

const CONTENT: Record<
  LogoVariant,
  {
    viewBox: string
    width: string
    height: string
    paths: SVGAttributes<SVGPathElement>[]
  }
> = {
  [LOGO_VARIANT.SINGLELINE]: {
    viewBox: '0 0 2323 257',
    width: '2323',
    height: '257',
    paths: [
      {
        d: 'M2164 220h159v36h-159Zm-21.3-86.4a64.7 64.7 0 0 0-64.9-61.2H2049a64.9 64.9 0 0 0-65 64.9V191a65.4 65.4 0 0 0 65 65.2h28.8c36 0 65-29.5 65-65.2v-3.6h-36.1v3.6a29 29 0 0 1-28.9 28.8H2049a29 29 0 0 1-29-28.8v-18.4h122.6Zm-122.6 10.1v-6.4a28.7 28.7 0 0 1 28.9-28.9h28.8a28.5 28.5 0 0 1 28.9 28.9v6.4Zm-216.3-71.3v183.8h36v-120l41.2-27.8h16.5a29 29 0 0 1 28.9 28.9v119h36v-119a65 65 0 0 0-64.9-65h-27.7l-30 20.2V72.4Zm-21.6 61.2a64.7 64.7 0 0 0-65-61.2h-28.8a64.9 64.9 0 0 0-64.9 64.9V191a65.4 65.4 0 0 0 65 65.2h28.8c36 0 64.9-29.5 64.9-65.2v-3.6h-36v3.6a29 29 0 0 1-29 28.8h-28.8a29 29 0 0 1-28.8-28.8v-18.4h122.6Zm-122.6 10.1v-6.4a28.7 28.7 0 0 1 28.8-28.9h28.9a28.5 28.5 0 0 1 28.8 28.9v6.4Zm-57.7-10a64.7 64.7 0 0 0-65-61.3h-28.8a64.9 64.9 0 0 0-64.9 64.9V191a65.4 65.4 0 0 0 65 65.2h28.8c36 0 64.9-29.5 64.9-65.2v-3.6h-36v3.6a29 29 0 0 1-29 28.8h-28.8a29 29 0 0 1-28.8-28.8v-18.4h122.6Zm-122.6 10v-6.4a28.7 28.7 0 0 1 28.8-28.9h28.9a28.5 28.5 0 0 1 28.8 28.9v6.4ZM1263 .2v256h36v-120l41.1-27.8h16.6a29 29 0 0 1 28.8 28.9v119h36.1v-119a65 65 0 0 0-64.9-65h-27.8L1299 92.6V.2Zm-265 220V.2h-95.6v36.1h59.5v183.9h-59.5v36H1061v-36Zm-117.2-86.6a64.7 64.7 0 0 0-65-61.2H787a64.9 64.9 0 0 0-64.9 64.9V191a65.4 65.4 0 0 0 65 65.2h28.8c36 0 64.9-29.5 64.9-65.2v-3.6h-36.1v3.6a29 29 0 0 1-28.8 28.8H787a29 29 0 0 1-28.8-28.8v-18.4h122.6Zm-122.6 10.1v-6.4a28.7 28.7 0 0 1 28.8-28.9h29a28.5 28.5 0 0 1 28.8 28.9v6.4Zm-120.8 76.5V72.4h-95.6v36h59.5v111.8h-59.5v36h158.7v-36ZM597.7 39.9h39.7v-36h-39.7ZM361.5 72.4v183.8h36.1v-120l41.1-27.8h16.6a29 29 0 0 1 28.8 28.9v119h36v-119c0-36.1-29.1-65-64.8-65h-27.8l-29.9 20.2V72.4Zm-21.6 0h-36v20.1l-30-20.1h-27.7a64.9 64.9 0 0 0-65 64.9v54a65 65 0 0 0 65 65h27.7l30-20.3v20.2h36Zm-122.6 119v-54.1a29 29 0 0 1 28.9-28.9h16.5l41.2 27.8v56.2l-41.2 27.8h-16.5a29 29 0 0 1-28.9-28.9ZM159.6.1h-36v92.3l-30-20.1H66a64.9 64.9 0 0 0-65 64.9v54a65 65 0 0 0 65 65h27.7l30-20.3v20.2h36ZM37 191.3v-54a29 29 0 0 1 29-28.9h16.6l41 27.8v56.2l-41 27.8H65.9A29 29 0 0 1 37 191.3Z',
        fillRule: 'evenodd',
      },
    ],
  },
  [LOGO_VARIANT.MULTILINE]: {
    viewBox: '0 0 1063 549',
    width: '1063',
    height: '549',
    paths: [
      {
        d: 'M902 512h159v36H902ZM1 548.2v-256h36v92.3l30-20.1h27.7a64.9 64.9 0 0 1 64.9 64.9v119h-36v-119a29 29 0 0 0-28.9-28.9H78.1l-41 27.8v120H1Zm274-183.8c35 0 63 27 64.9 61.2v39H217.3V483a29 29 0 0 0 28.8 28.8H275a29 29 0 0 0 28.8-28.8v-3.6h36v3.6a65.2 65.2 0 0 1-64.8 65.2h-29a65.4 65.4 0 0 1-64.9-65.2v-53.7a65 65 0 0 1 65-65H275Zm180.3 0c35 0 63 27 64.9 61.2v39H397.6V483a29 29 0 0 0 28.8 28.8h28.9A29 29 0 0 0 484 483v-3.6h36v3.6a65.2 65.2 0 0 1-64.8 65.2h-28.9a65.4 65.4 0 0 1-64.9-65.2v-53.7a65 65 0 0 1 65-65h28.8Zm86.5 183.8V364.4h36v20.1l30-20.1h27.7a64.9 64.9 0 0 1 65 64.9v119h-36.1v-119a29 29 0 0 0-28.9-28.9H619l-41.1 27.8v120h-36.1Zm274-183.8c35 0 63.1 27 65 61.2v39H758V483a29 29 0 0 0 28.9 28.8h28.8a29 29 0 0 0 28.9-28.8v-3.6h36v3.6a65.2 65.2 0 0 1-64.9 65.2H787a65.4 65.4 0 0 1-65-65.2v-53.7a65 65 0 0 1 65-65h28.8Zm-598.5 64.9v6.4h86.5v-6.4a28.5 28.5 0 0 0-28.8-28.9h-29c-16.2 0-28.8 13-28.8 28.9Zm180.3 0v6.4H484v-6.4a28.5 28.5 0 0 0-28.8-28.9h-28.9c-16.2 0-28.8 13-28.8 28.9Zm360.5 0v6.4h86.6v-6.4a28.5 28.5 0 0 0-28.9-28.9H787c-16.2 0-28.9 13-28.9 28.9ZM123.6.3h36v256h-36V236l-30 20.2H66a65 65 0 0 1-65-64.9v-54a65 65 0 0 1 65-65h27.7l30 20.2V.2Zm216.3 72h-36v20.2l-30-20.1h-27.7a64.9 64.9 0 0 0-65 64.9v54a65 65 0 0 0 65 65h27.7l30-20.3v20.2h36V72.4Zm21.6 184v-184h36.1v20.2l30-20.1h27.7a64.9 64.9 0 0 1 64.9 64.9v119h-36v-119a29 29 0 0 0-29-28.9h-16.5l-41.1 27.8v120h-36Zm275.9-36.1V72.4h-95.6v36h59.5v111.8h-59.5v36h158.7v-36h-63.1ZM815.9 72.4c35 0 63 27 64.9 61.2v39H758.2V191a29 29 0 0 0 28.8 28.8h29a29 29 0 0 0 28.8-28.8v-3.6h36v3.6a65.2 65.2 0 0 1-64.8 65.2h-29a65.4 65.4 0 0 1-64.9-65.2v-53.7a65 65 0 0 1 65-65h28.8ZM997.9.2v220h63.1v36H902.4v-36h59.5V36.3h-59.5V.3h95.5ZM37 137.2v54.1a29 29 0 0 0 29 28.9h16.6l41-27.8v-56.2l-41-27.8H65.9A29 29 0 0 0 37 137.3Zm180.3 54.1v-54a29 29 0 0 1 28.9-28.9h16.5l41.2 27.8v56.2l-41.2 27.8h-16.5a29 29 0 0 1-28.9-28.9Zm540.9-54v6.4h86.5v-6.4a28.5 28.5 0 0 0-28.8-28.9H787c-16.2 0-28.8 13-28.8 28.9ZM597.7 39.9h39.7v-36h-39.7v36Z',
        fillRule: 'evenodd',
      },
    ],
  },
  [LOGO_VARIANT.SQUARE]: {
    viewBox: '0 0 1000 1000',
    width: '1000',
    height: '1000',
    paths: [
      {
        d: 'M600.5 245h-73.4v510h73.4V521.9h176.1V755H850V245h-73.4v204H600.5Zm-259.7 0H150v510h190.8c72.6 0 132-59.7 132-131.9v-247c0-72.8-59.4-131.1-132-131.1ZM223.4 681.4V318h117.4c33 0 58.7 26.2 58.7 58.2v247c0 32-26.4 58.3-58.7 58.3Z',
        fillRule: 'evenodd',
      },
    ],
  },
  [LOGO_VARIANT.SQUARE_CUT]: {
    viewBox: '0 0 1000 1000',
    width: '1000',
    height: '1000',
    paths: [
      {
        d: 'M1000 1000H0V0h1000v1000ZM150 245h190.8c72.6 0 132 58.3 132 131.1v247c0 72.2-59.4 131.9-132 131.9H150V245Zm377.1 0h73.4v204h176.1V245H850v510h-73.4V521.9H600.5V755h-73.4V245Zm-303.7 73v363.4l117.4.1a58.7 58.7 0 0 0 58.7-58.3v-247c0-32-25.7-58.2-58.7-58.2H223.4Z',
        fillRule: 'evenodd',
      },
    ],
  },
}

interface LogoProps {
  color?: LogoColor
  variant?: LogoVariant
  className?: string
}

export const Logo = ({
  color = LOGO_COLOR.CURRENT,
  variant = LOGO_VARIANT.SINGLELINE,
  className,
  ...svgProps
}: LogoProps): JSX.Element => {
  const { viewBox, width, height, paths } = useMemo(() => CONTENT[variant], [variant])

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={width}
      height={height}
      className={cn('h-full min-h-full w-auto max-w-full', className)}
      {...svgProps}
    >
      {paths.map((pathData, index) => (
        <path
          key={index}
          className={cn([
            color === LOGO_COLOR.PRIMARY && 'fill-primary',
            color === LOGO_COLOR.WHITE && 'fill-white',
            color === LOGO_COLOR.BLACK && 'fill-black',
            color === LOGO_COLOR.CURRENT && 'fill-current',
          ])}
          {...pathData}
        />
      ))}
    </svg>
  )
}
