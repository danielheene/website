import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  family: 'PP Frama Text',
  fonts: [
    {
      src: path.join(dirname, './files/pp-frama-text-300-italic.ttf'),
      fontWeight: 100,
      fontStyle: 'italic',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-300-normal.ttf'),
      fontWeight: 100,
      fontStyle: 'normal',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-300-italic.ttf'),
      fontWeight: 200,
      fontStyle: 'italic',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-300-normal.ttf'),
      fontWeight: 200,
      fontStyle: 'normal',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-300-italic.ttf'),
      fontWeight: 300,
      fontStyle: 'italic',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-300-normal.ttf'),
      fontWeight: 300,
      fontStyle: 'normal',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-400-italic.ttf'),
      fontWeight: 400,
      fontStyle: 'italic',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-400-normal.ttf'),
      fontWeight: 400,
      fontStyle: 'normal',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-400-italic.ttf'),
      fontWeight: 500,
      fontStyle: 'italic',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-400-normal.ttf'),
      fontWeight: 500,
      fontStyle: 'normal',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-400-italic.ttf'),
      fontWeight: 600,
      fontStyle: 'italic',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-400-normal.ttf'),
      fontWeight: 600,
      fontStyle: 'normal',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-700-italic.ttf'),
      fontWeight: 700,
      fontStyle: 'italic',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-700-normal.ttf'),
      fontWeight: 700,
      fontStyle: 'normal',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-700-italic.ttf'),
      fontWeight: 800,
      fontStyle: 'italic',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-700-normal.ttf'),
      fontWeight: 800,
      fontStyle: 'normal',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-700-italic.ttf'),
      fontWeight: 900,
      fontStyle: 'italic',
    },
    {
      src: path.join(dirname, './files/pp-frama-text-700-normal.ttf'),
      fontWeight: 900,
      fontStyle: 'normal',
    },
  ],
}
