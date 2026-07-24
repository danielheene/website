import { Font } from '@react-pdf/renderer'

import PPFrama from '@/fonts/pp-frama/pdf'
import PPFramaText from '@/fonts/pp-frama-text/pdf'
import PPSupplyMono from '@/fonts/pp-supply-mono/pdf'
import PPSupplySans from '@/fonts/pp-supply-sans/pdf'

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
    Font.getRegisteredFonts()
    registeredFonts[font] = fontMap[font].family
  }

  return registeredFonts as Record<K, string>
}
