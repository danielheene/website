import { type JSX, type Ref, type SVGAttributes, useMemo } from 'react'

import { cn } from 'tailwind-variants'

export enum LogoColor {
  Primary = 'primary',
  White = 'white',
  Black = 'black',
  Inherit = 'inherit',
}

export enum LogoVariant {
  Inline = 'inline',
  Wrapped = 'wrapped',
  Square = 'square',
  Initials = 'initials',
}

interface LogoProps
  extends Omit<SVGAttributes<SVGElement>, 'width' | 'height' | 'viewBox' | 'xlmns'> {
  color?: `${LogoColor}`
  variant?: `${LogoVariant}`
  className?: string
  ref?: Ref<SVGSVGElement>
  blink?: boolean
}

export const Logo = ({
  color = LogoColor.Primary,
  variant = LogoVariant.Inline,
  className: classNameProp,
  blink,
  ...externalSVGProps
}: LogoProps): JSX.Element => {
  const className = useMemo(
    () =>
      cn([
        'h-[1em] w-auto shrink-0',
        '[&>path]:fill-current [&>path]:stroke-none',
        color === LogoColor.White && 'text-white [&>.contrast]:fill-primary',
        color === LogoColor.Black && 'text-black [&>.contrast]:fill-white',
        color === LogoColor.Primary && 'text-primary [&>.contrast]:fill-white',
        color === LogoColor.Inherit && 'text-inherit',
        blink && '[&>.bar]:animate-blink',
        classNameProp,
      ]),
    [
      classNameProp,
      blink,
      color,
    ],
  )

  const { width, height } = useMemo(() => {
    if (variant === LogoVariant.Wrapped)
      return {
        width: 1060,
        height: 549,
      }
    if (variant === LogoVariant.Square || variant === LogoVariant.Initials)
      return {
        width: 1000,
        height: 1000,
      }
    return {
      width: 2296,
      height: 257,
    }
  }, [
    variant,
  ])

  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: <TODO>
    <svg
      {...externalSVGProps}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {variant === LogoVariant.Wrapped && (
        <>
          <path className="bar" d="M901 512h159v36H901Z" />
          <path d="M879.7 425.6a64.7 64.7 0 0 0-64.9-61.2H786a64.9 64.9 0 0 0-65 64.9V483a65.4 65.4 0 0 0 65 65.2h28.8c36 0 65-29.5 65-65.2v-3.6h-36.1v3.6a29 29 0 0 1-28.9 28.8H786A29 29 0 0 1 757 483v-18.4h122.6Zm-122.6 10.1v-6.4a28.7 28.7 0 0 1 28.9-28.9h28.8a28.5 28.5 0 0 1 28.9 28.9v6.4Zm-216.3-71.3v183.8h36v-120l41.2-27.8h16.5a29 29 0 0 1 28.9 28.9v119h36v-119c0-36.1-29.2-65-64.9-65h-27.7l-30 20.2v-20.1Zm-21.6 61.2a64.7 64.7 0 0 0-65-61.2h-28.8a64.9 64.9 0 0 0-64.9 64.9V483a65.4 65.4 0 0 0 65 65.2h28.8c36 0 64.9-29.5 64.9-65.2v-3.6h-36v3.6a29 29 0 0 1-29 28.8h-28.8a29 29 0 0 1-28.8-28.8v-18.4h122.6Zm-122.6 10.1v-6.4a28.7 28.7 0 0 1 28.8-28.9h28.9a28.5 28.5 0 0 1 28.8 28.9v6.4Zm-57.7-10a64.7 64.7 0 0 0-65-61.3h-28.8a64.9 64.9 0 0 0-64.9 64.9V483a65.4 65.4 0 0 0 65 65.2H274c36 0 64.9-29.5 64.9-65.2v-3.6h-36v3.6a29 29 0 0 1-29 28.8h-28.8a29 29 0 0 1-28.8-28.8v-18.4h122.6Zm-122.6 10v-6.4a28.7 28.7 0 0 1 28.8-28.9H274a28.5 28.5 0 0 1 28.8 28.9v6.4ZM0 292.2v256h36v-120l41.1-27.8h16.6a29 29 0 0 1 28.8 28.9v119h36.1v-119c0-36.1-29.2-65-64.9-65H65.9L36 384.6v-92.3Zm997-72V.2h-95.6v36.1h59.5v183.9h-59.5v36H1060v-36Zm-117.2-86.6a64.7 64.7 0 0 0-65-61.2H786a64.9 64.9 0 0 0-64.9 64.9V191a65.4 65.4 0 0 0 65 65.2h28.8c36 0 64.9-29.5 64.9-65.2v-3.6h-36.1v3.6a29 29 0 0 1-28.8 28.8H786a29 29 0 0 1-28.8-28.8v-18.4h122.6Zm-122.6 10.1v-6.4a28.7 28.7 0 0 1 28.8-28.9H815a28.5 28.5 0 0 1 28.8 28.9v6.4Zm-120.8 76.5V72.4h-95.6v36h59.5v111.8h-59.5v36h158.7v-36ZM596.7 39.9h39.7v-36h-39.7ZM360.5 72.4v183.8h36.1v-120l41.1-27.8h16.6a29 29 0 0 1 28.8 28.9v119h36v-119c0-36.1-29.1-65-64.8-65h-27.8l-29.9 20.2V72.4Zm-21.6 0h-36v20.1l-30-20.1h-27.7a64.9 64.9 0 0 0-65 64.9v54a65 65 0 0 0 65 65h27.7l30-20.3v20.2h36Zm-122.6 119v-54.1a29 29 0 0 1 28.9-28.9h16.5l41.2 27.8v56.2l-41.2 27.8h-16.5a29 29 0 0 1-28.9-28.9ZM158.6.1h-36v92.3l-30-20.1H65a64.9 64.9 0 0 0-65 64.9v54a65 65 0 0 0 65 65h27.7l30-20.3v20.2h36ZM36 191.3v-54A29 29 0 0 1 65 108.4h16.6l41 27.8v56.2l-41 27.8H64.9A29 29 0 0 1 36 191.3Z" />
        </>
      )}
      {variant === LogoVariant.Inline && (
        <>
          <path className="bar" d="M2163 220h159v36h-159Z" />
          <path d="M2141.7 133.6a64.7 64.7 0 0 0-64.9-61.2H2048a64.9 64.9 0 0 0-65 64.9V191a65.4 65.4 0 0 0 65 65.2h28.8c36 0 65-29.5 65-65.2v-3.6h-36.1v3.6a29 29 0 0 1-28.9 28.8H2048A29 29 0 0 1 2019 191v-18.4h122.6Zm-122.6 10.1v-6.4a28.7 28.7 0 0 1 28.9-28.9h28.8a28.5 28.5 0 0 1 28.9 28.9v6.4Zm-216.3-71.3v183.8h36v-120l41.2-27.8h16.5a29 29 0 0 1 28.9 28.9v119h36v-119c0-36.1-29.2-65-64.9-65h-27.7l-30 20.2V72.4Zm-21.6 61.2a64.7 64.7 0 0 0-65-61.2h-28.8a64.9 64.9 0 0 0-64.9 64.9V191a65.4 65.4 0 0 0 65 65.2h28.8c36 0 64.9-29.5 64.9-65.2v-3.6h-36v3.6a29 29 0 0 1-29 28.8h-28.8a29 29 0 0 1-28.8-28.8v-18.4h122.6Zm-122.6 10.1v-6.4a28.7 28.7 0 0 1 28.8-28.9h28.9a28.5 28.5 0 0 1 28.8 28.9v6.4Zm-57.7-10a64.7 64.7 0 0 0-65-61.3h-28.8a64.9 64.9 0 0 0-64.9 64.9V191a65.4 65.4 0 0 0 65 65.2h28.8c36 0 64.9-29.5 64.9-65.2v-3.6h-36v3.6a29 29 0 0 1-29 28.8h-28.8a29 29 0 0 1-28.8-28.8v-18.4h122.6Zm-122.6 10v-6.4a28.7 28.7 0 0 1 28.8-28.9h28.9a28.5 28.5 0 0 1 28.8 28.9v6.4ZM1262 .2v256h36v-120l41.1-27.8h16.6a29 29 0 0 1 28.8 28.9v119h36.1v-119c0-36.1-29.2-65-64.9-65h-27.8L1298 92.6V.2Zm-265 220V.2h-95.6v36.1h59.5v183.9h-59.5v36H1060v-36Zm-117.2-86.6a64.7 64.7 0 0 0-65-61.2H786a64.9 64.9 0 0 0-64.9 64.9V191a65.4 65.4 0 0 0 65 65.2h28.8c36 0 64.9-29.5 64.9-65.2v-3.6h-36.1v3.6a29 29 0 0 1-28.8 28.8H786a29 29 0 0 1-28.8-28.8v-18.4h122.6Zm-122.6 10.1v-6.4a28.7 28.7 0 0 1 28.8-28.9H815a28.5 28.5 0 0 1 28.8 28.9v6.4Zm-120.8 76.5V72.4h-95.6v36h59.5v111.8h-59.5v36h158.7v-36ZM596.7 39.9h39.7v-36h-39.7ZM360.5 72.4v183.8h36.1v-120l41.1-27.8h16.6a29 29 0 0 1 28.8 28.9v119h36v-119c0-36.1-29.1-65-64.8-65h-27.8l-29.9 20.2V72.4Zm-21.6 0h-36v20.1l-30-20.1h-27.7a64.9 64.9 0 0 0-65 64.9v54a65 65 0 0 0 65 65h27.7l30-20.3v20.2h36Zm-122.6 119v-54.1a29 29 0 0 1 28.9-28.9h16.5l41.2 27.8v56.2l-41.2 27.8h-16.5a29 29 0 0 1-28.9-28.9ZM158.6.1h-36v92.3l-30-20.1H65a64.9 64.9 0 0 0-65 64.9v54a65 65 0 0 0 65 65h27.7l30-20.3v20.2h36ZM36 191.3v-54A29 29 0 0 1 65 108.4h16.6l41 27.8v56.2l-41 27.8H64.9A29 29 0 0 1 36 191.3Z" />
        </>
      )}
      {variant === LogoVariant.Square && (
        <>
          <path d="M0 1000h1000V0H0Z" />
          <path
            className="contrast"
            d="M594.5 245H521.1v510h73.38V521.86h176.13V755H844V245h-73.38v204H594.5Zm-259.7 0H144v510h190.8c72.65 0 132.09-59.74 132.09-131.87V376.14c0-72.85-59.44-131.14-132.1-131.14ZM217.38 681.41V317.86H334.8c33.02 0 58.7 26.23 58.7 58.28v246.99c0 32.06-26.41 58.28-58.7 58.28Z"
          />
        </>
      )}
      {variant === LogoVariant.Initials && (
        <path d="M594.5 245H521.1v510h73.38V521.86h176.13V755H844V245h-73.38v204H594.5Zm-259.7 0H144v510h190.8c72.65 0 132.09-59.74 132.09-131.87V376.14c0-72.85-59.44-131.14-132.1-131.14ZM217.38 681.41V317.86H334.8c33.02 0 58.7 26.23 58.7 58.28v246.99c0 32.06-26.41 58.28-58.7 58.28Z" />
      )}
    </svg>
  )
}
