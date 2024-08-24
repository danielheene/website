import { isNull, isNumber, isObject, isString } from 'lodash-es'

export type LogoCloudEntry = {
  id: string
  logo: {
    url: string
    alt: string
  }
}

export const isLogoCloudEntry = (item: any): item is LogoCloudEntry =>
  isString(item.id) &&
  !isNull(item.id) &&
  isObject(item.logo) &&
  !isNumber(item.logo) &&
  isString(item.logo.url) &&
  isString(item.logo.alt)
