/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import type { Metadata } from 'next'

import config from '@payload-config'
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
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

export const generateMetadata = async (args: Args): Promise<Metadata> => {
  const params = await args.params
  const searchParams = await args.searchParams
  return generatePageMetadata({ config, params, searchParams })
}

const Page = async (args: Args) => {
  const params = await args.params
  const searchParams = await args.searchParams
  return RootPage({ config, params, searchParams, importMap })
}

export default Page
