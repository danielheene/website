import { ImageResponse } from 'next/og'

import { cn } from '@/lib/cn'
//
// const interMedium = fetch(new URL('/fonts/pp-frama/pp-frama-500-normal.ttf', process.env.SERVER_URL)).then((res) =>
//   res.arrayBuffer(),
// )
//
// const interRegular = fetch(new URL('/fonts/pp-frama-text/pp-frama-text-400-normal.ttf', process.env.SERVER_URL)).then((res) =>
//   res.arrayBuffer(),
// )

export const alt = 'About Acme'
export const size = {
  width: 1200,
  height: 630,
}
export default async function Image() {
  // const [fontMedium, fontRegular] = await Promise.all([interMedium, interRegular])
  // const url = new URL(req.nextUrl)
  // const values = Object.fromEntries(url.searchParams)
  // const mode = (values.mode || 'light') as 'dark' | 'light'
  const mode = 'dark'

  return new ImageResponse(
    <div
      tw={cn(
        'relative flex h-full w-full items-end px-10 pt-20',
        mode === 'dark' ? 'bg-neutral-900 text-neutral-100' : 'bg-neutral-100 text-neutral-900',
      )}
    >
      <div tw="flex flex-col pb-20">
        <div tw="flex items-center">
          <div
            tw={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg',
              mode === 'dark'
                ? 'bg-neutral-900 text-neutral-100'
                : 'bg-neutral-100 text-neutral-900',
            )}
          >
            {/** biome-ignore lint/a11y/noSvgWithoutTitle: <TODO> */}
            <svg
              fill="none"
              height={30}
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width={30}
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m14.31 8 5.74 9.94" />
              <path d="M9.69 8h11.48" />
              <path d="m7.38 12 5.74-9.94" />
              <path d="M9.69 16 3.95 6.06" />
              <path d="M14.31 16H2.83" />
              <path d="m16.62 12-5.74 9.94" />
            </svg>
          </div>
          <span tw="ml-4 text-xl font-medium">Shadcn UI Blocks</span>
        </div>

        <h1 tw="mt-8 text-6xl leading-[1.2] tracking-tighter max-w-xl">
          Beautifully Designed Shadcn UI Blocks
        </h1>
        <p
          tw={cn(
            'my-0 max-w-xl text-2xl leading-relaxed',
            mode === 'dark' ? 'text-neutral-400' : 'text-neutral-500',
          )}
        >
          Shadcn UI Blocks is a collection of beautifully designed block and components for your
          next project.
        </p>
      </div>

      <div
        tw={cn(
          'flex h-full w-full grow overflow-hidden rounded-tl-xl border border-r-0 border-b-0 p-1',
          mode === 'dark' ? 'border-neutral-700/70' : 'border-neutral-200',
        )}
      >
        {/** biome-ignore lint/performance/noImgElement: <TODO> */}
        <img
          alt="Akash Moradiya"
          src="https://cdn.pixabay.com/photo/2020/12/14/15/48/stair-5831253_1280.jpg"
          style={{
            objectFit: 'cover',
            objectPosition: 'top left',
          }}
          tw={cn(
            'rounded-tl-lg border border-r-0 border-b-0',
            mode === 'dark' ? 'border-neutral-700/70' : 'border-neutral-200',
          )}
        />
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      // fonts: [
      //   {
      //     name: 'Inter',
      //     data: fontMedium,
      //     style: 'normal',
      //     weight: 500,
      //   },
      //   {
      //     name: 'Inter',
      //     data: fontRegular,
      //     style: 'normal',
      //     weight: 400,
      //   },
      // ],
    },
  )
}
