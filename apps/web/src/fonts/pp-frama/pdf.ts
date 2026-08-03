import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  family: 'PP Frama',
  fonts: [
    { src: path.join(dirname, './files/pp-frama-100-italic.ttf'), fontWeight: 100, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-100-normal.ttf'), fontWeight: 100, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-frama-200-italic.ttf'), fontWeight: 200, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-200-normal.ttf'), fontWeight: 200, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-frama-300-italic.ttf'), fontWeight: 300, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-300-normal.ttf'), fontWeight: 300, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-frama-400-italic.ttf'), fontWeight: 400, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-400-normal.ttf'), fontWeight: 400, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-frama-500-italic.ttf'), fontWeight: 500, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-500-normal.ttf'), fontWeight: 500, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-frama-500-italic.ttf'), fontWeight: 600, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-500-normal.ttf'), fontWeight: 600, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-frama-700-italic.ttf'), fontWeight: 700, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-700-normal.ttf'), fontWeight: 700, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-frama-700-italic.ttf'), fontWeight: 800, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-700-normal.ttf'), fontWeight: 800, fontStyle: 'normal' },
    { src: path.join(dirname, './files/pp-frama-900-italic.ttf'), fontWeight: 900, fontStyle: 'italic' },
    { src: path.join(dirname, './files/pp-frama-900-normal.ttf'), fontWeight: 900, fontStyle: 'normal' },
  ],
}
