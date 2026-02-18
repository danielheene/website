import { Font } from '@react-pdf/renderer'

import Inter from './inter'
import JetbrainsMono from './jetbrains-mono'
import PPFramer from './pp-framer'
import PPFramerText from './pp-framer-text'
import PPSupplyMono from './pp-supply-mono'

const fontMap = {
  Inter: Inter,
  JetbrainsMono: JetbrainsMono,
  PPFramerText: PPFramerText,
  PPSupplyMono: PPSupplyMono,
  PPFramer: PPFramer,
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
