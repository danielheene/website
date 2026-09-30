/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import config from '@payload-config'
import { generatePageMetadata, RootPage } from '@payloadcms/next/views'

import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({
    config,
    params,
    searchParams,
  })

// Local change: generatePageMetadata reads cookies (i18n), which Cache Components rejects on an
// otherwise prerenderable route. This marker opts the page into request-time rendering.
// Re-apply if Payload regenerates this file.
const Connection = async () => {
  await connection()
  return null
}

const Page = ({ params, searchParams }: Args) => (
  <>
    {RootPage({
      config,
      params,
      searchParams,
      importMap,
    })}
    <Suspense>
      <Connection />
    </Suspense>
  </>
)

export default Page
