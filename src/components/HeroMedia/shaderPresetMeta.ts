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
 * `src/fields/HeroBackground/index.ts`.
 */

export type ShaderPresetKey = 'darkveil' | 'faulty-terminal' | 'gradient-blinds' | 'grainient'

export type ShaderPresetMeta = {
  key: ShaderPresetKey
  label: string
}

export const SHADER_PRESET_META: ShaderPresetMeta[] = [
  {
    key: 'darkveil',
    label: 'Dark Veil',
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
]
