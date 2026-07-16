import { Font } from '@react-pdf/renderer'

import PPFrama from '@danielheene/font-pp-frama/pdf'
import PPFramaText from '@danielheene/font-pp-frama-text/pdf'
import PPSupplyMono from '@danielheene/font-pp-supply-mono/pdf'
import PPSupplySans from '@danielheene/font-pp-supply-sans/pdf'

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
