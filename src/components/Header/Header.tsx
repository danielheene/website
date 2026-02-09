import { HeaderClient } from '@/components/Header/Header.client'
import { getCachedHeaderNavigationData } from '@/lib/getHeaderNavigationData'
import React from 'react'

export const Header = async () => {
  const { mainNavigation } = await getCachedHeaderNavigationData()

  return <HeaderClient mainNavigation={mainNavigation} />
}
