import { HeaderClient } from '@/components/Header/Header.client'
import { getCachedHeaderData } from '@/data/getHeaderData'
import React from 'react'

export const Header = async () => {
  const { navigation } = await getCachedHeaderData()

  return <HeaderClient navigation={navigation} />
}
