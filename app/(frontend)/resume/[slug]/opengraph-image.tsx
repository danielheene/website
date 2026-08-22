import { notFound } from 'next/navigation'

import { ImageResponse } from 'takumi-js/response'

import { queryResumeDocumentBySlug } from './page'

export const alt = 'Resume'
export const size = {
  width: 1200,
  height: 630,
}

type Props = {
  params: Promise<{
    slug: string
  }>
}

export default async function Image({ params }: Props) {
  const { slug } = await params
  const resume = await queryResumeDocumentBySlug(slug)
  if (!resume) notFound()

  return new ImageResponse(
    <div tw="flex h-full w-full flex-col items-start justify-center bg-neutral-900 px-16 text-neutral-100">
      <p tw="text-2xl font-medium text-neutral-400">Resume</p>
      <h1 tw="mt-4 max-w-4xl text-6xl font-bold leading-[1.15] tracking-tight">
        {resume.title ?? 'Resume'}
      </h1>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
