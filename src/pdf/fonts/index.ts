import { Font } from '@react-pdf/renderer'

import PPFrama from './pp-frama'
import PPFramaText from './pp-frama-text'
import PPSupplyMono from './pp-supply-mono'
import PPSupplySans from './pp-supply-sans'

const fontMap = {
  PPFrama: PPFrama,
  PPFramaText: PPFramaText,
  PPSupplyMono: PPSupplyMono,
  PPSupplySans: PPSupplySans,
}

type FontName = keyof typeof fontMap

export const registerFonts = <T extends FontName[], K extends T[number]>(fonts: T) => {
  const registeredFonts = {}

  for (const font of fonts) {
    Font.register(fontMap[font] as Parameters<typeof Font.register>[number])
    registeredFonts[font] = fontMap[font].family
  }

  return registeredFonts as Record<K, string>
}
