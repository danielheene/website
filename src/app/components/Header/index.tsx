import React from 'react'

import type { Header } from '@payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import { HeaderNav } from '@/components/Header/Nav'
import { Logo } from '@/components/Logo'

export async function Header() {
  const header: Header = await getCachedGlobal('header', 1)()

  return (
    <header className="container relative z-20 py-8 flex justify-between">
      <Link href="/">
        <Logo />
      </Link>
      <HeaderNav header={header} />
    </header>
  )
}
