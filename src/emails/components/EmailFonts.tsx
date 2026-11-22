import { Font } from 'react-email'

import PPFramaText from '@/fonts/pp-frama-text/email'
import PPSupplyMono from '@/fonts/pp-supply-mono/email'
import PPSupplySans from '@/fonts/pp-supply-sans/email'

// each `Font` also sets `* { font-family }`, so the last face is the default: the body font
const FACES = [PPSupplySans, PPSupplyMono, PPFramaText]

type EmailFontsProps = {
  /** Prefixed to the files' `public/` paths, which inboxes can only load by absolute URL. */
  assetUrl: string
}

/** `@font-face` rules for the theme's font roles; belongs in `<Head>`. */
export const EmailFonts = ({ assetUrl }: EmailFontsProps) =>
  FACES.flatMap(({ family, fallback, fonts }) =>
    fonts.map(({ src, format, fontWeight, fontStyle }) => (
      <Font
        key={`${family}-${fontWeight}-${fontStyle}`}
        fontFamily={family}
        fallbackFontFamily={[...fallback]}
        webFont={{
          url: `${assetUrl}${src}`,
          format,
        }}
        fontWeight={fontWeight}
        fontStyle={fontStyle}
      />
    )),
  )
