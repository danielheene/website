import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/Button'
import { ImageMedia } from '@/components/ImageMedia'
import { Icon } from '@/components/Icon'

export default function NotFound() {
  return (
    <div className="pt-32 -mt-32 pb-20 -mb-20 relative overflow-hidden [&+footer]:text-white [&+footer]:bg-transparent">
      <ImageMedia
        alt=""
        fill
        duoTone
        priority
        url="/not-found.webp"
        className="absolute -bottom-2 -right-2 -top-2 -left-2 object-cover h-auto w-auto"
      />
      <div className="container relative z-10 h-full text-center text-white flex flex-col justify-center items-center">
        <div className="text-white font-pp-supply-mono drop-shadow-md mb-12">
          <h1 className="mb-10 text-9xl">404</h1>
          <p className="text-3xl">This page could not be found.</p>
        </div>
        <Button asChild variant="secondary" size="lg" className="text-xl font-mono">
          <Link href="/">
            GO TO HOMEPAGE
            <Icon name="arrow-forward" className="ml-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
