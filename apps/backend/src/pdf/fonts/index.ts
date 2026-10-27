import { Font } from '@react-pdf/renderer'

import PPFramaText from '@website/font-pp-frama-text/pdf'
import PPFrama from '@website/font-pp-frama/pdf'
import PPSupplyMono from '@website/font-pp-supply-mono/pdf'
import PPSupplySans from '@website/font-pp-supply-sans/pdf'

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
