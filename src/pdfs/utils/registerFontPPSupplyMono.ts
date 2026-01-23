import { Font } from '@react-pdf/renderer'

export const registerFontPPSupplyMono = () => {
  Font.register({
    family: 'PP Supply Mono',
    fonts: [
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-100.ttf',
        fontWeight: 100,
        fontStyle: 'normal',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-100.ttf',
        fontWeight: 100,
        fontStyle: 'italic',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-100.ttf',
        fontWeight: 200,
        fontStyle: 'normal',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-100.ttf',
        fontWeight: 200,
        fontStyle: 'italic',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-100.ttf',
        fontWeight: 300,
        fontStyle: 'normal',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-100.ttf',
        fontWeight: 300,
        fontStyle: 'italic',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-400.ttf',
        fontWeight: 400,
        fontStyle: 'normal',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-400.ttf',
        fontWeight: 400,
        fontStyle: 'italic',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-400.ttf',
        fontWeight: 500,
        fontStyle: 'normal',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-400.ttf',
        fontWeight: 500,
        fontStyle: 'italic',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-400.ttf',
        fontWeight: 600,
        fontStyle: 'normal',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-400.ttf',
        fontWeight: 600,
        fontStyle: 'italic',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-400.ttf',
        fontWeight: 700,
        fontStyle: 'normal',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-400.ttf',
        fontWeight: 700,
        fontStyle: 'italic',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-400.ttf',
        fontWeight: 800,
        fontStyle: 'normal',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-400.ttf',
        fontWeight: 800,
        fontStyle: 'italic',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-400.ttf',
        fontWeight: 900,
        fontStyle: 'normal',
      },
      {
        src: process.env.NEXT_PUBLIC_SERVER_URL + '/fonts/pp-supply-mono/pp-supply-mono-400.ttf',
        fontWeight: 900,
        fontStyle: 'italic',
      },
    ],
  })
}
