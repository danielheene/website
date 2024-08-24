import { LogoCloudEntry } from '../LogoCloud.shared'
import { cn } from '@/utilities/cn'
import { memo } from 'react'

interface LogoCloudItemProps {
  id: LogoCloudEntry['id']
  url: LogoCloudEntry['logo']['url']
  alt: LogoCloudEntry['logo']['alt']
}

export const LogoCarouselTile = memo(({ id, url, alt }: LogoCloudItemProps) => (
  <div key={id} className={cn('aspect-logo w-full relative bg-white rounded ')}>
    <div
      aria-description={alt}
      className="bg-primary absolute inset-2"
      style={{
        maskImage: `url(${url})`,
        maskPosition: 'center',
        maskRepeat: 'no-repeat',
        maskSize: 'contain',
      }}
    />
  </div>
))

LogoCarouselTile.displayName = 'LogoCloudItem'
