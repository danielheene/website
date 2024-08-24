import React from 'react'

import type { Footer } from '@payload-types'
import { FooterClient } from '@/components/Footer/index.client'
import { getCachedGlobal } from '@/utilities/getGlobals'

export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 1)()

  return <FooterClient footer={footer} />
}
