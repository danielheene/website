import { Font } from '@react-pdf/renderer'

export const registerFontJetBrainsMono = () => {
  Font.register({
    family: 'Jetbrains Mono',
    fonts: [
      {
        src:
          process.env.NEXT_PUBLIC_SERVER_URL +
          '/fonts/jetbrains-mono/jetbrains-mono-100-italic.ttf',
        fontWeight: 100,
        fontStyle: 'italic',
      },
      {
        src:
          process.env.NEXT_PUBLIC_SERVER_URL +
          '/fonts/jetbrains-mono/jetbrains-mono-100-normal.ttf',
        fontWeight: 100,
        fontStyle: 'normal',
      },
      {
        src:
          process.env.NEXT_PUBLIC_SERVER_URL +
          '/fonts/jetbrains-mono/jetbrains-mono-200-italic.ttf',
        fontWeight: 200,
        fontStyle: 'italic',
      },
      {
        src:
          process.env.NEXT_PUBLIC_SERVER_URL +
          '/fonts/jetbrains-mono/jetbrains-mono-200-normal.ttf',
        fontWeight: 200,
        fontStyle: 'normal',
      },
      {
        src:
          process.env.NEXT_PUBLIC_SERVER_URL +
          '/fonts/jetbrains-mono/jetbrains-mono-300-italic.ttf',
        fontWeight: 300,
        fontStyle: 'italic',
      },
      {
        src:
          process.env.NEXT_PUBLIC_SERVER_URL +
          '/fonts/jetbrains-mono/jetbrains-mono-300-normal.ttf',
        fontWeight: 300,
        fontStyle: 'normal',
      },
      {
        src:
          process.env.NEXT_PUBLIC_SERVER_URL +
          '/fonts/jetbrains-mono/jetbrains-mono-400-italic.ttf',
        fontWeight: 400,
        fontStyle: 'italic',
      },
      {
        src:
          process.env.NEXT_PUBLIC_SERVER_URL +
          '/fonts/jetbrains-mono/jetbrains-mono-400-normal.ttf',
        fontWeight: 400,
        fontStyle: 'normal',
      },
      {
        src:
          process.env.NEXT_PUBLIC_SERVER_URL +
          '/fonts/jetbrains-mono/jetbrains-mono-500-italic.ttf',
        fontWeight: 500,
        fontStyle: 'italic',
      },
      {
        src:
          process.env.NEXT_PUBLIC_SERVER_URL +
          '/fonts/jetbrains-mono/jetbrains-mono-500-normal.ttf',
        fontWeight: 500,
        fontStyle: 'normal',
      },
      {
        src:
          process.env.NEXT_PUBLIC_SERVER_URL +
          '/fonts/jetbrains-mono/jetbrains-mono-600-italic.ttf',
        fontWeight: 600,
        fontStyle: 'italic',
      },
      {
        src:
          process.env.NEXT_PUBLIC_SERVER_URL +
          '/fonts/jetbrains-mono/jetbrains-mono-600-normal.ttf',
        fontWeight: 600,
        fontStyle: 'normal',
      },
      {
        src:
          process.env.NEXT_PUBLIC_SERVER_URL +
          '/fonts/jetbrains-mono/jetbrains-mono-700-italic.ttf',
        fontWeight: 700,
        fontStyle: 'italic',
      },
      {
        src:
          process.env.NEXT_PUBLIC_SERVER_URL +
          '/fonts/jetbrains-mono/jetbrains-mono-700-normal.ttf',
        fontWeight: 700,
        fontStyle: 'normal',
      },
      {
        src:
          process.env.NEXT_PUBLIC_SERVER_URL +
          '/fonts/jetbrains-mono/jetbrains-mono-800-italic.ttf',
        fontWeight: 800,
        fontStyle: 'italic',
      },
      {
        src:
          process.env.NEXT_PUBLIC_SERVER_URL +
          '/fonts/jetbrains-mono/jetbrains-mono-800-normal.ttf',
        fontWeight: 800,
        fontStyle: 'normal',
      },
    ],
  })
}
