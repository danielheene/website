import { ImageResponse } from 'takumi-js/response'

export const alt = 'Blog'
export const size = {
  width: 1200,
  height: 630,
}

type Props = {
  params: Promise<{
    page: string
  }>
}

export default async function Image({ params }: Props) {
  const { page } = await params

  return new ImageResponse(
    <div tw="flex h-full w-full flex-col items-center justify-center bg-neutral-900 text-neutral-100">
      <h1 tw="text-7xl font-bold tracking-tight">Blog</h1>
      <p tw="mt-4 text-2xl text-neutral-400">Page {page}</p>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
