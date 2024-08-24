import { cn } from '@/utilities/cn'
import { LogoCloudEntry } from '../LogoCloud.shared'
import { JSX, memo } from 'react'
import { LogoCarouselTile } from './LogoCarouselTile'

interface LogoCloudRowProps {
  items: [LogoCloudEntry, LogoCloudEntry]
}

export const LogoCarouselRow = memo(
  ({ items }: LogoCloudRowProps): JSX.Element => (
    <div className={cn(['flex flex-row w-full my-3 gap-6'])}>
      {items.map(({ id, logo: { url, alt } }) => (
        <LogoCarouselTile key={id} id={id} url={url} alt={alt} />
      ))}
    </div>
  ),
)

LogoCarouselRow.displayName = 'LogoCloudRow'
