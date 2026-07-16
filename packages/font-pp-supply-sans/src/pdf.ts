import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  family: 'PP Supply Sans',
  fonts: [
    { src: path.join(dirname, './files/pp-supply-sans-200.ttf'), fontWeight: 200, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-supply-sans-200.ttf'), fontWeight: 200, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-supply-sans-400.ttf'), fontWeight: 400, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-supply-sans-400.ttf'), fontWeight: 400, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-supply-sans-500.ttf'), fontWeight: 500, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-supply-sans-500.ttf'), fontWeight: 500, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-supply-sans-700.ttf'), fontWeight: 700, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-supply-sans-700.ttf'), fontWeight: 700, fontStyle: 'italic' },
  ],
}
