import { Icon } from '@/components/Icon'
import { ImageMedia } from '@/components/ImageMedia'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="relative min-h-full py-32 flex flex-col items-center justify-center">
      <ImageMedia
        alt=""
        fill
        priority
        url="/not-found.webp"
        className="absolute -bottom-2 -right-2 -top-2 -left-2 object-cover"
      />
      <div className="container relative z-10 h-full text-center text-white flex flex-col justify-center items-center">
        <div className="text-white font-pp-supply-mono drop-shadow-md mb-20">
          <h1 className="text-9xl">404</h1>
          <p className="text-3xl">This page could not be found.</p>
        </div>
        <Button
          href="/"
          color="secondary"
          size="lg"
          className="text-4xl px-8 py-4 font-mono"
        >
          <span>GO TO HOMEPAGE</span>
          <Icon
            name="mdi:arrow-forward"
            className="ml-8 text-[110%] leading-[1em]"
          />
        </Button>
      </div>
    </div>
  )
}
