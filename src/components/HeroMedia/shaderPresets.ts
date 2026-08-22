export type ShaderPresetKey = 'darkveil' | 'faulty-terminal' | 'gradient-blinds' | 'grainient'

export type ShaderPreset = {
  key: ShaderPresetKey
  label: string
  /**
   * A static CSS gradient approximating this preset's real on-screen look,
   * for contexts that cannot run WebGL: OG images (Takumi/next-og cannot
   * execute canvas/WebGL) and the blog list view's card thumbnails.
   *
   * DarkVeil has no color props of its own (its look comes from an
   * intrinsic CPPN pattern generator) — its gradient here is a hand-picked
   * pair evoking its actual dark, moody on-screen appearance, not derived
   * from any prop value. The other three presets' gradients are derived
   * from their real preset color props (see Task 3/4's live-component
   * prop bundles) — kept as plain literal strings here, not computed, so
   * this file has zero dependency on the shader components themselves.
   */
  gradient: string
}

export const SHADER_PRESETS: ShaderPreset[] = [
  {
    key: 'darkveil',
    label: 'Dark Veil',
    gradient: 'linear-gradient(135deg, #0a0a12 0%, #1a1030 100%)',
  },
  {
    key: 'faulty-terminal',
    label: 'Faulty Terminal',
    gradient: 'linear-gradient(135deg, #001a0a 0%, #003d1a 100%)',
  },
  {
    key: 'gradient-blinds',
    label: 'Gradient Blinds',
    gradient: 'linear-gradient(135deg, #ff9ffc 0%, #5227ff 100%)',
  },
  {
    key: 'grainient',
    label: 'Grainient',
    gradient: 'linear-gradient(135deg, #ff9ffc 0%, #5227ff 50%, #b497cf 100%)',
  },
]

export const SHADER_PRESET_MAP: Record<ShaderPresetKey, ShaderPreset> = Object.fromEntries(
  SHADER_PRESETS.map((preset) => [
    preset.key,
    preset,
  ]),
) as Record<ShaderPresetKey, ShaderPreset>
