/**
 * The `key`/`label` half of `SHADER_PRESETS` (see `./shaderPresets.ts`),
 * without the `thumbnail: StaticImageData` field — and so without that
 * module's static `.png` imports.
 *
 * Anything that only needs preset identity/labels (a Payload field's
 * `select` options, the seed scripts' random preset pick) should import
 * from here instead of `./shaderPresets`: `payload migrate` and
 * `payload generate:types` evaluate `payload.config.ts`'s full field-config
 * graph under plain Node, which has no loader for bundler-only asset
 * imports — importing `shaderPresets.ts` from a field config file fails
 * there with `ERR_UNKNOWN_FILE_EXTENSION` on the first `.png`. Same
 * established pattern as this field's component path, documented in
 * `src/fields/HeroSlides/index.ts`.
 */

export type ShaderPresetKey =
  | 'crt-warp'
  | 'darkveil'
  | 'dither'
  | 'faulty-terminal'
  | 'gradient-blinds'
  | 'grainient'
  | 'pixel-blast'
  | 'silk'

export type ShaderPresetMeta = {
  key: ShaderPresetKey
  label: string
}

export const SHADER_PRESET_META: ShaderPresetMeta[] = [
  {
    key: 'crt-warp',
    label: 'CRT Warp',
  },
  {
    key: 'darkveil',
    label: 'Dark Veil',
  },
  {
    key: 'dither',
    label: 'Dither',
  },
  {
    key: 'faulty-terminal',
    label: 'Faulty Terminal',
  },
  {
    key: 'gradient-blinds',
    label: 'Gradient Blinds',
  },
  {
    key: 'grainient',
    label: 'Grainient',
  },
  {
    key: 'pixel-blast',
    label: 'Pixel Blast',
  },
  {
    key: 'silk',
    label: 'Silk',
  },
]
