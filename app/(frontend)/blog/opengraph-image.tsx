import { ImageResponse } from 'takumi-js/response'

export const alt = 'Blog'
export const size = {
  width: 1200,
  height: 630,
}

export default async function Image() {
  return new ImageResponse(
    <div tw="flex h-full w-full items-center justify-center bg-neutral-900 text-neutral-100">
      <h1 tw="text-7xl font-bold tracking-tight">Blog</h1>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
